"use client";

import { useActionState } from "react";
import { upsertReviewAction, type ReviewActionState } from "@/actions/reviews";
import { SubmitButton } from "@/components/auth/submit-button";

type ReviewFormProps = {
  businessId: string;
  existingRating?: number;
  existingComment?: string | null;
};

const initialState: ReviewActionState = { message: "" };

export function ReviewForm({ businessId, existingRating = 5, existingComment }: ReviewFormProps) {
  const [state, formAction] = useActionState(upsertReviewAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <input name="businessId" type="hidden" value={businessId} />
      <label className="grid gap-2" htmlFor="rating">
        <span className="text-sm font-black text-slate-800">التقييم</span>
        <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" defaultValue={existingRating} id="rating" name="rating">
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>{rating} نجوم</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2" htmlFor="comment">
        <span className="text-sm font-black text-slate-800">تعليقك</span>
        <textarea className="min-h-24 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" defaultValue={existingComment ?? ""} id="comment" name="comment" placeholder="اكتب تجربتك مع المحل" />
      </label>
      {state.message ? (
        <p className={state.success ? "text-sm font-bold text-green-700" : "text-sm font-bold text-red-700"}>{state.message}</p>
      ) : null}
      <SubmitButton>حفظ التقييم</SubmitButton>
    </form>
  );
}
