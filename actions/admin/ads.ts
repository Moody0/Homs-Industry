"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { adIdSchema, adUpsertSchema } from "@/lib/validation/admin";
import {
  ensureRecordExists,
  failure,
  nullableText,
  numberText,
  parseAdminForm,
  success,
  supabaseFailure,
  text,
  uploadAdminImage,
  validationFailure,
} from "./_helpers";

export async function upsertAdAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(adUpsertSchema, {
    adId: nullableText(formData, "adId"),
    altText: nullableText(formData, "altText"),
    businessId: nullableText(formData, "businessId"),
    categoryId: nullableText(formData, "categoryId"),
    description: nullableText(formData, "description"),
    endDate: text(formData, "endDate"),
    existingImageUrl: nullableText(formData, "existingImageUrl"),
    isActive: text(formData, "isActive"),
    linkUrl: text(formData, "linkUrl"),
    priority: numberText(formData, "priority"),
    startDate: text(formData, "startDate"),
    title: text(formData, "title"),
    type: text(formData, "type"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  if (parsed.data.categoryId) {
    const categoryMissing = await ensureRecordExists("categories", parsed.data.categoryId, "الفئة المرتبطة بالإعلان غير موجودة.");
    if (categoryMissing) return categoryMissing;
  }

  if (parsed.data.businessId) {
    const businessMissing = await ensureRecordExists("businesses", parsed.data.businessId, "المحل المرتبط بالإعلان غير موجود.");
    if (businessMissing) return businessMissing;
  }

  const imageUpload = await uploadAdminImage("ad-images", formData, "image");
  if (imageUpload.error) return failure(imageUpload.error);

  const imageUrl = imageUpload.url ?? parsed.data.existingImageUrl;
  if (!imageUrl) return failure("صورة الإعلان مطلوبة.");

  const supabase = await createAdminClient();
  const payload = {
    alt_text: parsed.data.altText,
    business_id: parsed.data.businessId,
    category_id: parsed.data.categoryId,
    description: parsed.data.description,
    end_date: parsed.data.endDate,
    image_url: imageUrl,
    is_active: parsed.data.isActive,
    link_url: parsed.data.linkUrl,
    priority: parsed.data.priority,
    start_date: parsed.data.startDate,
    title: parsed.data.title,
    type: parsed.data.type,
  };

  const result = parsed.data.adId
    ? await supabase.from("ads").update(payload).eq("id", parsed.data.adId)
    : await supabase.from("ads").insert(payload);

  if (result.error) return supabaseFailure(result.error, "تعذر حفظ الإعلان");

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return success(parsed.data.adId ? "تم تحديث الإعلان." : "تم إنشاء الإعلان.");
}

export async function deleteAdAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(adIdSchema, { adId: text(formData, "adId") });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createAdminClient();
  const { error } = await supabase.from("ads").delete().eq("id", parsed.data.adId);
  if (error) return supabaseFailure(error, "تعذر حذف الإعلان");

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return success("تم حذف الإعلان.");
}
