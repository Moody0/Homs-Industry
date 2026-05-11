"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";
import { slugifyArabic } from "@/lib/data/marketplace";
import { getPostgresPool } from "@/lib/db/postgres";
import { buildStoragePath, uploadLimits, validateImageFile } from "@/lib/uploads";
import { addBusinessSchema } from "@/lib/validation/business";

export type BusinessActionState = {
  message: string;
  success?: boolean;
};

function addBusinessErrorMessage(error: unknown) {
  const dbError = error as { code?: string; constraint?: string; message?: string };
  const message = dbError.message?.toLowerCase() ?? "";

  if (dbError.code === "23505") {
    if (dbError.constraint === "businesses_phone_key" || message.includes("businesses_phone_key")) {
      return "رقم الهاتف مستخدم مسبقاً لمحل آخر. استخدم رقماً مختلفاً.";
    }

    if (dbError.constraint === "businesses_slug_key" || message.includes("businesses_slug_key")) {
      return "تعذر إنشاء رابط فريد للمحل. حاول الإرسال مرة أخرى.";
    }

    return "يوجد سجل بنفس البيانات. راجع رقم الهاتف أو البيانات المدخلة.";
  }

  if (dbError.code === "23503") {
    if (dbError.constraint === "businesses_owner_id_fkey" || message.includes("businesses_owner_id_fkey")) {
      return "حسابك غير مكتمل ولا يمكن ربط المحل به. سجّل الخروج ثم ادخل مرة أخرى.";
    }

    if (message.includes("category") || message.includes("area") || message.includes("subcategory")) {
      return "الفئة أو المنطقة المختارة غير متاحة حالياً. حدّث الصفحة واختر من القائمة.";
    }

    return "تعذر ربط الطلب ببيانات موجودة. حدّث الصفحة وحاول مرة أخرى.";
  }

  if (dbError.code === "23514") {
    return "تأكد من الإحداثيات والحقول المطلوبة ثم حاول مرة أخرى.";
  }

  if (dbError.code === "22P02") {
    return "إحدى القيم المرسلة غير صالحة. حدّث الصفحة واختر من القوائم فقط.";
  }

  if (dbError.code === "42501") {
    return "لا توجد صلاحية كافية لحفظ الطلب. تأكد من إعدادات قاعدة البيانات.";
  }

  if (message.includes("invalid api key") || message.includes("jwt")) {
    return "مفتاح SUPABASE_SERVICE_ROLE_KEY غير صحيح. انسخ service_role key من Supabase ثم أعد تشغيل السيرفر.";
  }

  if (message.includes("fetch failed") || message.includes("network")) {
    return "تعذر الاتصال بخدمة رفع الصور. تحقق من إعدادات Supabase وحاول مرة أخرى.";
  }

  return "تعذر إرسال طلب إضافة المحل. تأكد من البيانات وحاول مرة أخرى.";
}

function storageUploadErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid api key") || normalized.includes("jwt")) {
    return "مفتاح SUPABASE_SERVICE_ROLE_KEY غير صحيح. انسخ service_role key من Supabase ثم أعد تشغيل السيرفر.";
  }

  if (normalized.includes("bucket") || normalized.includes("not found")) {
    return "مخزن الصور business-images غير موجود في Supabase. طبّق ترحيلات التخزين أو أنشئه من لوحة Supabase.";
  }

  return `تعذر رفع الصورة: ${message}`;
}

function value(formData: FormData, name: string) {
  const item = formData.get(name);
  return typeof item === "string" ? item : "";
}

function listValue(formData: FormData, name: string) {
  return value(formData, name)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function addBusinessAction(
  _previousState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  void _previousState;

  const user = await requireUser();
  const parsed = addBusinessSchema.safeParse({
    name: value(formData, "name"),
    categoryId: value(formData, "categoryId"),
    subcategoryId: value(formData, "subcategoryId") || null,
    areaId: value(formData, "areaId"),
    description: value(formData, "description"),
    phone: value(formData, "phone"),
    whatsappPhone: value(formData, "whatsappPhone") || null,
    address: value(formData, "address"),
    latitude: value(formData, "latitude") || null,
    longitude: value(formData, "longitude") || null,
    services: value(formData, "services"),
    products: value(formData, "products"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر إرسال الطلب" };
  }

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0)
    .slice(0, 6);

  for (const image of images) {
    const validation = validateImageFile(image, uploadLimits.businessImage);

    if (!validation.ok) {
      return { message: validation.message };
    }
  }

  if (images.length > 0 && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      message: "رفع الصور يحتاج تفعيل مفتاح التخزين في السيرفر. أضف SUPABASE_SERVICE_ROLE_KEY ثم حاول مرة أخرى.",
    };
  }

  const slug = `${slugifyArabic(parsed.data.name) || "business"}-${Date.now().toString(36)}`;
  const services = listValue(formData, "services");
  const products = listValue(formData, "products");
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const { rowCount: profileCount } = await client.query(
      "select 1 from public.profiles where id = $1::uuid limit 1",
      [user.id],
    );

    if (!profileCount) {
      await client.query("rollback");
      return { message: "حسابك غير مكتمل ولا يمكن ربط المحل به. سجّل الخروج ثم ادخل مرة أخرى." };
    }

    const { rows: areaRows } = await client.query<{ id: string; name: string }>(
      "select id::text, name from public.areas where id = $1::uuid limit 1",
      [parsed.data.areaId],
    );
    const area = areaRows[0];

    if (!area) {
      await client.query("rollback");
      return { message: "اختر منطقة صحيحة من القائمة" };
    }

    const { rowCount: categoryCount } = await client.query(
      "select 1 from public.categories where id = $1::uuid and is_active = true limit 1",
      [parsed.data.categoryId],
    );

    if (!categoryCount) {
      await client.query("rollback");
      return { message: "اختر فئة صحيحة من القائمة" };
    }

    if (parsed.data.subcategoryId) {
      const { rowCount: subcategoryCount } = await client.query(
        "select 1 from public.subcategories where id = $1::uuid and category_id = $2::uuid and is_active = true limit 1",
        [parsed.data.subcategoryId, parsed.data.categoryId],
      );

      if (!subcategoryCount) {
        await client.query("rollback");
        return { message: "اختر فئة فرعية صحيحة من القائمة" };
      }
    }

    const { rows: businessRows } = await client.query<{ id: string }>(
      `insert into public.businesses (
        owner_id, category_id, subcategory_id, area_id, name, slug, description,
        phone, whatsapp_phone, address, area, latitude, longitude, status, is_featured
      )
      values ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10, $11, $12::numeric, $13::numeric, 'pending', false)
      returning id::text`,
      [
        user.id,
        parsed.data.categoryId,
        parsed.data.subcategoryId,
        area.id,
        parsed.data.name,
        slug,
        parsed.data.description,
        parsed.data.phone,
        parsed.data.whatsappPhone,
        parsed.data.address,
        area.name,
        parsed.data.latitude ? Number(parsed.data.latitude) : null,
        parsed.data.longitude ? Number(parsed.data.longitude) : null,
      ],
    );

    const business = businessRows[0];
    if (!business) {
      await client.query("rollback");
      return { message: "تعذر إرسال طلب إضافة المحل. تأكد من البيانات وحاول مرة أخرى." };
    }

    for (const [index, name] of services.entries()) {
      await client.query(
        "insert into public.business_services (business_id, name, sort_order) values ($1::uuid, $2, $3)",
        [business.id, name, index],
      );
    }

    for (const [index, name] of products.entries()) {
      await client.query(
        "insert into public.business_products (business_id, name, sort_order) values ($1::uuid, $2, $3)",
        [business.id, name, index],
      );
    }

    const uploadedImages: { image_url: string; sort_order: number; is_cover: boolean }[] = [];

    if (images.length > 0) {
      const supabaseAdmin = createAdminClient();

      for (const [index, image] of images.entries()) {
        const validation = validateImageFile(image, uploadLimits.businessImage);

        if (!validation.ok) {
          await client.query("rollback");
          return { message: validation.message };
        }

        const path = buildStoragePath([user.id, business.id, String(index)], validation.extension);
        const { error: uploadError } = await supabaseAdmin.storage
          .from("business-images")
          .upload(path, image, { upsert: false });

        if (uploadError) {
          await client.query("rollback");
          return { message: storageUploadErrorMessage(uploadError.message) };
        }

        const { data } = supabaseAdmin.storage.from("business-images").getPublicUrl(path);
        uploadedImages.push({
          image_url: data.publicUrl,
          sort_order: index,
          is_cover: index === 0,
        });
      }
    }

    for (const image of uploadedImages) {
      await client.query(
        "insert into public.business_images (business_id, image_url, sort_order, is_cover) values ($1::uuid, $2, $3, $4)",
        [business.id, image.image_url, image.sort_order, image.is_cover],
      );
    }

    if (uploadedImages[0]) {
      await client.query("update public.businesses set cover_image_url = $1 where id = $2::uuid", [
        uploadedImages[0].image_url,
        business.id,
      ]);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    console.error("Add business failed", error);
    return { message: addBusinessErrorMessage(error) };
  } finally {
    client.release();
  }

  revalidatePath("/");
  revalidatePath("/add-business");

  return {
    success: true,
    message: "تم إرسال طلب إضافة المحل بنجاح، سيتم مراجعته من قبل الإدارة",
  };
}
