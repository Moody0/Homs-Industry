import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number;
  className?: string;
  showValue?: boolean;
};

export function RatingStars({ rating, className, showValue = true }: RatingStarsProps) {
  const rounded = Math.round(Number(rating || 0));

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showValue ? <span className="font-black text-slate-900">{Number(rating || 0).toFixed(1)}</span> : null}
      <span className="inline-flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            aria-hidden
            className={cn(
              "size-4",
              index < rounded ? "fill-orange-500 text-orange-500" : "fill-slate-200 text-slate-200",
            )}
            key={index}
          />
        ))}
      </span>
    </span>
  );
}
