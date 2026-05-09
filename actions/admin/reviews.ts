"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { reviewIdSchema, reviewModerationSchema } from "@/lib/validation/admin";
import { parseAdminForm, revalidateBusinessById, success, supabaseFailure, text, validationFailure } from "./_helpers";

async function getReviewBusinessId(reviewId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("business_id").eq("id", reviewId).maybeSingle();
  return data?.business_id ?? null;
}

export async function moderateReviewAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(reviewModerationSchema, {
    reviewId: text(formData, "reviewId"),
    status: text(formData, "status"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status: parsed.data.status }).eq("id", parsed.data.reviewId);
  if (error) return supabaseFailure(error, "تعذر تحديث التقييم");

  const businessId = await getReviewBusinessId(parsed.data.reviewId);
  revalidatePath("/admin/reviews");
  if (businessId) await revalidateBusinessById(businessId);
  return success(parsed.data.status === "approved" ? "تم قبول التقييم." : "تم رفض التقييم.");
}

export async function deleteReviewAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(reviewIdSchema, { reviewId: text(formData, "reviewId") });
  if (parsed.error) return validationFailure(parsed.error);

  const businessId = await getReviewBusinessId(parsed.data.reviewId);
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", parsed.data.reviewId);
  if (error) return supabaseFailure(error, "تعذر حذف التقييم");

  revalidatePath("/admin/reviews");
  if (businessId) await revalidateBusinessById(businessId);
  return success("تم حذف التقييم.");
}
