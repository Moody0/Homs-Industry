"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { slugifyArabic } from "@/lib/data/marketplace";

export type DashboardActionState = {
  message: string;
  success?: boolean;
};

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value ? value : null;
}

function list(formData: FormData, name: string) {
  return text(formData, name)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function checkedList(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

async function requireOwnedBusiness(businessId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug, owner_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business || business.owner_id !== user.id) {
    return { error: "لا تملك صلاحية تعديل هذا المحل" as const, supabase, user };
  }

  return { business, supabase, user };
}

function revalidateOwnerBusiness(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/businesses/${slug}`);
  revalidatePath(`/businesses/${slug}`);
  revalidatePath("/search");
}

export async function updateOwnerBusinessAction(
  _previousState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  void _previousState;
  const businessId = text(formData, "businessId");
  const context = await requireOwnedBusiness(businessId);
  if ("error" in context) return { message: context.error ?? "لا تملك صلاحية تعديل هذا المحل" };

  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const address = text(formData, "address");
  const area = text(formData, "area");

  if (name.length < 2 || phone.length < 5 || address.length < 3 || area.length < 2) {
    return { message: "تأكد من تعبئة اسم المحل والهاتف والعنوان والمنطقة" };
  }

  const latitude = nullableText(formData, "latitude");
  const longitude = nullableText(formData, "longitude");
  const yearsExperience = nullableText(formData, "yearsExperience");
  const nextSlug = text(formData, "slug") || `${slugifyArabic(name) || "business"}-${Date.now().toString(36)}`;

  const { error } = await context.supabase
    .from("businesses")
    .update({
      address,
      area,
      brochure_url: nullableText(formData, "brochureUrl"),
      description: nullableText(formData, "description"),
      languages: checkedList(formData, "languages"),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      name,
      owner_bio: nullableText(formData, "ownerBio"),
      payment_methods: checkedList(formData, "paymentMethods"),
      phone,
      price_range: nullableText(formData, "priceRange"),
      service_modes: checkedList(formData, "serviceModes"),
      slug: nextSlug,
      team_info: nullableText(formData, "teamInfo"),
      whatsapp_phone: nullableText(formData, "whatsappPhone"),
      years_experience: yearsExperience ? Number(yearsExperience) : null,
    })
    .eq("id", businessId);

  if (error) return { message: "تعذر حفظ بيانات المحل. تأكد من البيانات وحاول مرة أخرى." };

  revalidateOwnerBusiness(nextSlug);
  return { success: true, message: "تم حفظ بيانات المحل. قد يحتاج للمراجعة قبل ظهوره للعامة." };
}

export async function updateOwnerHoursAction(
  _previousState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  void _previousState;
  const businessId = text(formData, "businessId");
  const context = await requireOwnedBusiness(businessId);
  if ("error" in context) return { message: context.error ?? "لا تملك صلاحية تعديل هذا المحل" };

  const rows = Array.from({ length: 7 }, (_, day) => {
    const isClosed = text(formData, `closed_${day}`) === "on";
    return {
      business_id: businessId,
      closes_at: isClosed ? null : text(formData, `closes_${day}`),
      day_of_week: day,
      is_closed: isClosed,
      opens_at: isClosed ? null : text(formData, `opens_${day}`),
    };
  });

  const { error } = await context.supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "business_id,day_of_week" });

  if (error) return { message: "تعذر حفظ ساعات العمل. تأكد من أن وقت الإغلاق بعد الافتتاح." };

  revalidateOwnerBusiness(context.business.slug);
  return { success: true, message: "تم حفظ ساعات العمل." };
}

export async function updateOwnerCatalogAction(
  _previousState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  void _previousState;
  const businessId = text(formData, "businessId");
  const context = await requireOwnedBusiness(businessId);
  if ("error" in context) return { message: context.error ?? "لا تملك صلاحية تعديل هذا المحل" };

  const services = list(formData, "services").map((line, index) => {
    const [name, description] = line.split("|").map((part) => part?.trim() ?? "");
    return { business_id: businessId, description: description || null, name, sort_order: index };
  }).filter((item) => item.name);

  const products = list(formData, "products").map((line, index) => {
    const [name, price, description] = line.split("|").map((part) => part?.trim() ?? "");
    const priceNumber = price ? Number(price) : null;
    return {
      business_id: businessId,
      description: description || null,
      name,
      price: Number.isFinite(priceNumber) ? priceNumber : null,
      sort_order: index,
    };
  }).filter((item) => item.name);

  const images = list(formData, "images").map((line, index) => {
    const [imageUrl, altText] = line.split("|").map((part) => part?.trim() ?? "");
    return {
      alt_text: altText || null,
      business_id: businessId,
      image_url: imageUrl,
      is_cover: index === 0,
      sort_order: index,
    };
  }).filter((item) => item.image_url);

  await Promise.all([
    context.supabase.from("business_services").delete().eq("business_id", businessId),
    context.supabase.from("business_products").delete().eq("business_id", businessId),
    context.supabase.from("business_images").delete().eq("business_id", businessId),
  ]);

  const errors = await Promise.all([
    services.length ? context.supabase.from("business_services").insert(services) : Promise.resolve({ error: null }),
    products.length ? context.supabase.from("business_products").insert(products) : Promise.resolve({ error: null }),
    images.length ? context.supabase.from("business_images").insert(images) : Promise.resolve({ error: null }),
    context.supabase
      .from("businesses")
      .update({ cover_image_url: images[0]?.image_url ?? null })
      .eq("id", businessId),
  ]);

  if (errors.some((result) => result.error)) {
    return { message: "تعذر حفظ الخدمات أو المنتجات أو المعرض." };
  }

  revalidateOwnerBusiness(context.business.slug);
  return { success: true, message: "تم حفظ الخدمات والمنتجات والمعرض." };
}

export async function updateOwnerTrustAction(
  _previousState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  void _previousState;
  const businessId = text(formData, "businessId");
  const context = await requireOwnedBusiness(businessId);
  if ("error" in context) return { message: context.error ?? "لا تملك صلاحية تعديل هذا المحل" };

  const certificates = list(formData, "certificates").map((line) => {
    const [title, fileUrl, description] = line.split("|").map((part) => part?.trim() ?? "");
    return {
      business_id: businessId,
      description: description || null,
      file_url: fileUrl,
      status: "pending",
      title,
    };
  }).filter((item) => item.title && item.file_url);

  const projects = list(formData, "projects").map((line, index) => {
    const [title, beforeImageUrl, afterImageUrl, description] = line.split("|").map((part) => part?.trim() ?? "");
    return {
      after_image_url: afterImageUrl || null,
      before_image_url: beforeImageUrl || null,
      business_id: businessId,
      description: description || null,
      sort_order: index,
      title: title || null,
    };
  }).filter((item) => item.before_image_url || item.after_image_url);

  await Promise.all([
    context.supabase.from("business_certificates").delete().eq("business_id", businessId),
    context.supabase.from("business_project_images").delete().eq("business_id", businessId),
  ]);

  const results = await Promise.all([
    certificates.length ? context.supabase.from("business_certificates").insert(certificates) : Promise.resolve({ error: null }),
    projects.length ? context.supabase.from("business_project_images").insert(projects) : Promise.resolve({ error: null }),
  ]);

  if (results.some((result) => result.error)) {
    return { message: "تعذر حفظ ملفات الثقة أو معرض المشاريع." };
  }

  revalidateOwnerBusiness(context.business.slug);
  return { success: true, message: "تم حفظ ملفات الثقة والمشاريع، وتنتظر الشهادات موافقة الإدارة." };
}

export async function replyToReviewAction(
  _previousState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  void _previousState;
  const reviewId = text(formData, "reviewId");
  const businessId = text(formData, "businessId");
  const reply = text(formData, "reply");
  const context = await requireOwnedBusiness(businessId);
  if ("error" in context) return { message: context.error ?? "لا تملك صلاحية تعديل هذا المحل" };

  if (reply.length < 2) return { message: "اكتب رداً أوضح على التقييم" };

  const { error } = await context.supabase.from("review_replies").upsert(
    {
      business_id: businessId,
      owner_id: context.user.id,
      reply,
      review_id: reviewId,
    },
    { onConflict: "review_id" },
  );

  if (error) return { message: "تعذر حفظ الرد على التقييم." };

  revalidateOwnerBusiness(context.business.slug);
  return { success: true, message: "تم حفظ الرد على التقييم." };
}
