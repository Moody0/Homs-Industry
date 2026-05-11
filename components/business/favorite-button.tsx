"use client";

import { useActionState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toggleFavoriteAction, type FavoriteActionState } from "@/actions/favorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  businessId: string;
  isFavorite: boolean;
  disabled?: boolean;
};

function FavoriteSubmitButton({ isFavorite }: { isFavorite: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition disabled:pointer-events-none disabled:opacity-70",
        isFavorite ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50",
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Heart aria-hidden className={cn("size-4", isFavorite && "fill-orange-500 text-orange-500")} />}
      {isFavorite ? "في المفضلة" : "أضف للمفضلة"}
    </button>
  );
}

export function FavoriteButton({ businessId, isFavorite, disabled }: FavoriteButtonProps) {
  const initialState: FavoriteActionState = { favorite: isFavorite, message: "" };
  const [state, formAction] = useActionState(toggleFavoriteAction, initialState);
  const currentFavorite = state.favorite ?? isFavorite;

  if (disabled) {
    return (
      <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600" href="/login">
        <Heart aria-hidden className="size-4" />
        تسجيل الدخول للمفضلة
      </a>
    );
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input name="businessId" type="hidden" value={businessId} />
      <input name="intent" type="hidden" value={currentFavorite ? "remove" : "add"} />
      <FavoriteSubmitButton isFavorite={currentFavorite} />
      {state.message ? (
        <span className={state.success ? "text-xs font-bold text-green-200" : "text-xs font-bold text-red-200"}>{state.message}</span>
      ) : null}
    </form>
  );
}
