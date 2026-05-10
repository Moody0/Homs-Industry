"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { success, supabaseFailure } from "./_helpers";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function revalidateBusiness(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string) {
  const { data } = await supabase.from("businesses").select("slug").eq("id", businessId).maybeSingle();
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/reports");
  if (data?.slug) revalidatePath(`/businesses/${data.slug}`);
}

export async function toggleBusinessVerifiedAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const businessId = text(formData, "businessId");
  const isVerified = text(formData, "isVerified") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ is_verified: !isVerified }).eq("id", businessId);
  if (error) return supabaseFailure(error, "تعذر تعديل التوثيق");
  await revalidateBusiness(supabase, businessId);
  return success(isVerified ? "تم إلغاء التوثيق." : "تم توثيق المحل.");
}

export async function toggleBusinessTrustedAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const businessId = text(formData, "businessId");
  const isTrusted = text(formData, "isTrusted") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ is_trusted: !isTrusted }).eq("id", businessId);
  if (error) return supabaseFailure(error, "تعذر تعديل الثقة");
  await revalidateBusiness(supabase, businessId);
  return success(isTrusted ? "تم إلغاء شارة موثوق." : "تم منح شارة موثوق.");
}

export async function moderateCertificateAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const certificateId = text(formData, "certificateId");
  const status = text(formData, "status");
  if (!["approved", "rejected"].includes(status)) return { success: false, message: "حالة الشهادة غير صالحة" };

  const supabase = await createClient();
  const { data: certificate } = await supabase
    .from("business_certificates")
    .select("business_id")
    .eq("id", certificateId)
    .maybeSingle();

  const { error } = await supabase
    .from("business_certificates")
    .update({
      approved_at: status === "approved" ? new Date().toISOString() : null,
      approved_by: status === "approved" ? admin.id : null,
      status,
    })
    .eq("id", certificateId);

  if (error) return supabaseFailure(error, "تعذر تعديل الشهادة");
  revalidatePath("/admin/reports");
  if (certificate?.business_id) await revalidateBusiness(supabase, certificate.business_id);
  return success(status === "approved" ? "تم قبول الشهادة." : "تم رفض الشهادة.");
}

export async function moderateReviewReportAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const reportId = text(formData, "reportId");
  const status = text(formData, "status");
  if (!["approved", "rejected"].includes(status)) return { success: false, message: "حالة البلاغ غير صالحة" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("review_reports")
    .update({ admin_note: text(formData, "adminNote") || null, status })
    .eq("id", reportId);

  if (error) return supabaseFailure(error, "تعذر تعديل البلاغ");
  revalidatePath("/admin/reviews");
  return success(status === "approved" ? "تم قبول البلاغ." : "تم إغلاق البلاغ.");
}
