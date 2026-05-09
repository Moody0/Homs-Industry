"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { slugifyArabic } from "@/lib/data/marketplace";
import { buildStoragePath, uploadLimits, validateImageFile } from "@/lib/uploads";
import { addBusinessSchema } from "@/lib/validation/business";

export type BusinessActionState = {
  message: string;
  success?: boolean;
};

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

  const supabase = await createClient();
  const { data: area } = await supabase
    .from("areas")
    .select("id, name")
    .eq("id", parsed.data.areaId)
    .single();

  if (!area) {
    return { message: "اختر منطقة صحيحة من القائمة" };
  }

  const slug = `${slugifyArabic(parsed.data.name) || "business"}-${Date.now().toString(36)}`;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      category_id: parsed.data.categoryId,
      subcategory_id: parsed.data.subcategoryId,
      area_id: area.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      phone: parsed.data.phone,
      whatsapp_phone: parsed.data.whatsappPhone,
      address: parsed.data.address,
      area: area.name,
      latitude: parsed.data.latitude ? Number(parsed.data.latitude) : null,
      longitude: parsed.data.longitude ? Number(parsed.data.longitude) : null,
      status: "pending",
      is_featured: false,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    return { message: "تعذر إرسال طلب إضافة المحل. تأكد من البيانات وحاول مرة أخرى." };
  }

  const services = listValue(formData, "services");
  if (services.length > 0) {
    await supabase.from("business_services").insert(
      services.map((name, index) => ({
        business_id: business.id,
        name,
        sort_order: index,
      })),
    );
  }

  const products = listValue(formData, "products");
  if (products.length > 0) {
    await supabase.from("business_products").insert(
      products.map((name, index) => ({
        business_id: business.id,
        name,
        sort_order: index,
      })),
    );
  }

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0)
    .slice(0, 6);

  const uploadedImages: { image_url: string; sort_order: number; is_cover: boolean }[] = [];

  for (const [index, image] of images.entries()) {
    const validation = validateImageFile(image, uploadLimits.businessImage);

    if (!validation.ok) {
      return { message: validation.message };
    }

    const path = buildStoragePath([user.id, business.id, String(index)], validation.extension);
    const { error: uploadError } = await supabase.storage
      .from("business-images")
      .upload(path, image, { upsert: false });

    if (!uploadError) {
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      uploadedImages.push({
        image_url: data.publicUrl,
        sort_order: index,
        is_cover: index === 0,
      });
    }
  }

  if (uploadedImages.length > 0) {
    await supabase.from("business_images").insert(
      uploadedImages.map((image) => ({
        business_id: business.id,
        ...image,
      })),
    );

    await supabase
      .from("businesses")
      .update({ cover_image_url: uploadedImages[0].image_url })
      .eq("id", business.id);
  }

  revalidatePath("/");
  revalidatePath("/add-business");

  return {
    success: true,
    message: "تم إرسال طلب إضافة المحل بنجاح، سيتم مراجعته من قبل الإدارة",
  };
}
