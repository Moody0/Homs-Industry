"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { reviewSchema } from "@/lib/validation/review";

export type ReviewActionState = {
  message: string;
  success?: boolean;
};

export async function upsertReviewAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  void _previousState;

  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    businessId: formData.get("businessId"),
    rating: formData.get("rating"),
    qualityRating: formData.get("qualityRating") || null,
    serviceRating: formData.get("serviceRating") || null,
    valueRating: formData.get("valueRating") || null,
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر حفظ التقييم" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").upsert(
    {
      business_id: parsed.data.businessId,
      user_id: user.id,
      rating: Number(parsed.data.rating),
      quality_rating: parsed.data.qualityRating ? Number(parsed.data.qualityRating) : null,
      service_rating: parsed.data.serviceRating ? Number(parsed.data.serviceRating) : null,
      value_rating: parsed.data.valueRating ? Number(parsed.data.valueRating) : null,
      comment: parsed.data.comment || null,
      status: "approved",
    },
    { onConflict: "business_id,user_id" },
  );

  if (error) {
    return { message: "تعذر حفظ التقييم. حاول مرة أخرى." };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", parsed.data.businessId)
    .single();

  if (business?.slug) {
    revalidatePath(`/businesses/${business.slug}`);
  }

  return { success: true, message: "تم حفظ تقييمك بنجاح" };
}

export async function toggleHelpfulReviewAction(formData: FormData) {
  const user = await requireUser();
  const reviewId = String(formData.get("reviewId") ?? "");
  const businessSlug = String(formData.get("businessSlug") ?? "");
  const supabase = await createClient();

  if (!reviewId) return;

  const { data: existing } = await supabase
    .from("review_helpful_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("review_helpful_votes").delete().eq("review_id", reviewId).eq("user_id", user.id);
  } else {
    await supabase.from("review_helpful_votes").insert({ review_id: reviewId, user_id: user.id });
  }

  if (businessSlug) revalidatePath(`/businesses/${businessSlug}`);
}

export async function reportReviewAction(formData: FormData) {
  const user = await requireUser();
  const reviewId = String(formData.get("reviewId") ?? "");
  const businessSlug = String(formData.get("businessSlug") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const supabase = await createClient();

  if (!reviewId || reason.length < 3) return;

  await supabase.from("review_reports").upsert(
    {
      reason,
      review_id: reviewId,
      status: "pending",
      user_id: user.id,
    },
    { onConflict: "review_id,user_id" },
  );

  if (businessSlug) revalidatePath(`/businesses/${businessSlug}`);
}

export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser();
  const businessId = String(formData.get("businessId") ?? "");
  const supabase = await createClient();

  if (businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("slug")
      .eq("id", businessId)
      .single();

    await supabase
      .from("reviews")
      .delete()
      .eq("business_id", businessId)
      .eq("user_id", user.id);

    if (business?.slug) {
      revalidatePath(`/businesses/${business.slug}`);
    }
  }
}
