"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { dbQuery } from "@/lib/db/postgres";
import { reviewSchema } from "@/lib/validation/review";
import { z } from "zod";

export type ReviewActionState = {
  message: string;
  success?: boolean;
};

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

const guidSchema = z.guid();

async function getApprovedReviewBusinessSlug(reviewId: string) {
  const parsed = guidSchema.safeParse(reviewId);
  if (!parsed.success) return null;

  const result = await dbQuery<{ slug: string }>(
    `
      select b.slug
      from public.reviews r
      join public.businesses b on b.id = r.business_id
      where r.id = $1::uuid
        and r.status = 'approved'
        and b.status = 'approved'
      limit 1
    `,
    [parsed.data],
  );

  return result.rows[0]?.slug ?? null;
}

export async function upsertReviewAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  void _previousState;

  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    businessId: formText(formData, "businessId"),
    rating: formData.get("rating"),
    qualityRating: formData.get("qualityRating") || null,
    serviceRating: formData.get("serviceRating") || null,
    valueRating: formData.get("valueRating") || null,
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر حفظ التقييم" };
  }

  const businessResult = await dbQuery<{ slug: string }>(
    "select slug from public.businesses where id = $1::uuid and status = 'approved' limit 1",
    [parsed.data.businessId],
  );
  const business = businessResult.rows[0];

  if (!business) {
    return { message: "تعذر العثور على المحل المطلوب. حدّث الصفحة وحاول مرة أخرى." };
  }

  try {
    await dbQuery(
      `
        insert into public.reviews (
          business_id,
          user_id,
          rating,
          quality_rating,
          service_rating,
          value_rating,
          comment,
          status
        )
        values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, 'approved')
        on conflict (business_id, user_id) do update
        set
          rating = excluded.rating,
          quality_rating = excluded.quality_rating,
          service_rating = excluded.service_rating,
          value_rating = excluded.value_rating,
          comment = excluded.comment,
          status = 'approved',
          updated_at = now()
      `,
      [
        parsed.data.businessId,
        user.id,
        Number(parsed.data.rating),
        parsed.data.qualityRating ? Number(parsed.data.qualityRating) : null,
        parsed.data.serviceRating ? Number(parsed.data.serviceRating) : null,
        parsed.data.valueRating ? Number(parsed.data.valueRating) : null,
        parsed.data.comment || null,
      ],
    );
  } catch (error) {
    console.error("Review upsert failed:", error);
    return { message: "تعذر حفظ التقييم. حاول مرة أخرى." };
  }

  revalidatePath(`/businesses/${business.slug}`);

  return { success: true, message: "تم حفظ تقييمك بنجاح" };
}

export async function toggleHelpfulReviewAction(formData: FormData) {
  const user = await requireUser();
  const reviewId = formText(formData, "reviewId");
  const parsedReviewId = guidSchema.safeParse(reviewId);
  const businessSlug = formText(formData, "businessSlug") || await getApprovedReviewBusinessSlug(reviewId);

  if (!parsedReviewId.success || !businessSlug) return;

  await dbQuery(
    `
      with deleted as (
        delete from public.review_helpful_votes
        where review_id = $1::uuid
          and user_id = $2::uuid
        returning 1
      )
      insert into public.review_helpful_votes (review_id, user_id)
      select $1::uuid, $2::uuid
      where not exists (select 1 from deleted)
      on conflict do nothing
    `,
    [parsedReviewId.data, user.id],
  );

  if (businessSlug) revalidatePath(`/businesses/${businessSlug}`);
}

export async function reportReviewAction(formData: FormData) {
  const user = await requireUser();
  const reviewId = formText(formData, "reviewId");
  const parsedReviewId = guidSchema.safeParse(reviewId);
  const businessSlug = formText(formData, "businessSlug") || await getApprovedReviewBusinessSlug(reviewId);
  const reason = formText(formData, "reason");

  if (!parsedReviewId.success || !businessSlug || reason.length < 3) return;

  await dbQuery(
    `
      insert into public.review_reports (reason, review_id, status, user_id)
      values ($1, $2::uuid, 'pending', $3::uuid)
      on conflict (review_id, user_id) do update
      set
        reason = excluded.reason,
        status = 'pending',
        updated_at = now()
    `,
    [reason, parsedReviewId.data, user.id],
  );

  if (businessSlug) revalidatePath(`/businesses/${businessSlug}`);
}

export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser();
  const businessId = formText(formData, "businessId");
  const parsed = guidSchema.safeParse(businessId);

  if (parsed.success) {
    const businessResult = await dbQuery<{ slug: string }>(
      "select slug from public.businesses where id = $1::uuid limit 1",
      [parsed.data],
    );
    const business = businessResult.rows[0];

    await dbQuery(
      "delete from public.reviews where business_id = $1::uuid and user_id = $2::uuid",
      [parsed.data, user.id],
    );

    if (business?.slug) {
      revalidatePath(`/businesses/${business.slug}`);
    }
  }
}
