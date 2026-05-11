"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { dbQuery } from "@/lib/db/postgres";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { reviewIdSchema, reviewModerationSchema } from "@/lib/validation/admin";
import { parseAdminForm, revalidateBusinessById, success, text, validationFailure } from "./_helpers";

async function getReviewBusinessId(reviewId: string) {
  const result = await dbQuery<{ business_id: string }>(
    "select business_id::text from public.reviews where id = $1::uuid limit 1",
    [reviewId],
  );
  return result.rows[0]?.business_id ?? null;
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

  try {
    await dbQuery(
      "update public.reviews set status = $1, updated_at = now() where id = $2::uuid",
      [parsed.data.status, parsed.data.reviewId],
    );
  } catch (error) {
    console.error("Admin review moderation failed:", error);
    return { success: false, message: "تعذر تحديث التقييم" };
  }

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
  try {
    await dbQuery("delete from public.reviews where id = $1::uuid", [parsed.data.reviewId]);
  } catch (error) {
    console.error("Admin review delete failed:", error);
    return { success: false, message: "تعذر حذف التقييم" };
  }

  revalidatePath("/admin/reviews");
  if (businessId) await revalidateBusinessById(businessId);
  return success("تم حذف التقييم.");
}
