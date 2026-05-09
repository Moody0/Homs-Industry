import { Heart } from "lucide-react";
import { addFavoriteAction, removeFavoriteAction } from "@/actions/favorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  businessId: string;
  isFavorite: boolean;
  disabled?: boolean;
};

export function FavoriteButton({ businessId, isFavorite, disabled }: FavoriteButtonProps) {
  if (disabled) {
    return (
      <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600" href="/login">
        <Heart aria-hidden className="size-4" />
        تسجيل الدخول للمفضلة
      </a>
    );
  }

  return (
    <form action={isFavorite ? removeFavoriteAction : addFavoriteAction}>
      <input name="businessId" type="hidden" value={businessId} />
      <button className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition", isFavorite ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50")} type="submit">
        <Heart aria-hidden className={cn("size-4", isFavorite && "fill-orange-500 text-orange-500")} />
        {isFavorite ? "في المفضلة" : "أضف للمفضلة"}
      </button>
    </form>
  );
}
