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
