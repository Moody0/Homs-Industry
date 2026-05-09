"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  businessIdSchema,
  rejectBusinessSchema,
  toggleBusinessFeaturedSchema,
  updateBusinessSchema,
} from "@/lib/validation/admin";
import {
  nullableText,
  parseAdminForm,
  revalidateBusinessById,
  success,
  supabaseFailure,
  text,
  validationFailure,
} from "./_helpers";

export async function approveBusinessAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = parseAdminForm(businessIdSchema, { businessId: text(formData, "businessId") });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
      rejection_reason: null,
      status: "approved",
    })
    .eq("id", parsed.data.businessId);

  if (error) return supabaseFailure(error, "تعذر قبول المحل");

  revalidatePath("/admin/businesses");
  await revalidateBusinessById(parsed.data.businessId);
  return success("تم قبول المحل بنجاح.");
}

export async function rejectBusinessAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(rejectBusinessSchema, {
    businessId: text(formData, "businessId"),
    rejectionReason: nullableText(formData, "rejectionReason") ?? "",
  });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      approved_at: null,
      approved_by: null,
      rejection_reason: parsed.data.rejectionReason,
      status: "rejected",
    })
    .eq("id", parsed.data.businessId);

  if (error) return supabaseFailure(error, "تعذر رفض المحل");

  revalidatePath("/admin/businesses");
  await revalidateBusinessById(parsed.data.businessId);
  return success("تم رفض المحل وحفظ سبب الرفض.");
}

export async function toggleBusinessFeaturedAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(toggleBusinessFeaturedSchema, {
    businessId: text(formData, "businessId"),
    isFeatured: text(formData, "isFeatured"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ is_featured: !parsed.data.isFeatured })
    .eq("id", parsed.data.businessId);

  if (error) return supabaseFailure(error, "تعذر تعديل حالة التمييز");

  revalidatePath("/admin/businesses");
  await revalidateBusinessById(parsed.data.businessId);
  return success(parsed.data.isFeatured ? "تم إلغاء تمييز المحل." : "تم تمييز المحل.");
}

export async function updateBusinessAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(updateBusinessSchema, {
    area: text(formData, "area"),
    businessId: text(formData, "businessId"),
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    status: text(formData, "status"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      area: parsed.data.area,
      name: parsed.data.name,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.businessId);

  if (error) return supabaseFailure(error, "تعذر تحديث المحل");

  revalidatePath("/admin/businesses");
  await revalidateBusinessById(parsed.data.businessId);
  return success("تم تحديث بيانات المحل.");
}

export async function deleteBusinessAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(businessIdSchema, { businessId: text(formData, "businessId") });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").delete().eq("id", parsed.data.businessId);
  if (error) return supabaseFailure(error, "تعذر حذف المحل");

  revalidatePath("/admin/businesses");
  revalidatePath("/");
  return success("تم حذف المحل.");
}
