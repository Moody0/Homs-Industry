import Link from "next/link";
import Image from "next/image";
import { Factory, Star, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { BusinessSummary } from "@/lib/data/marketplace";

export function TopRatedList({ businesses }: { businesses: BusinessSummary[] }) {
  return (
    <aside className="self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950"><TrendingUp aria-hidden className="size-5 text-slate-950" /> الأكثر تقييماً</h2>
      </div>
      <div className="grid gap-3">
        {businesses.map((business) => (
          <Link className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-orange-200 hover:bg-orange-50" href={`/businesses/${business.slug}`} key={business.id}>
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#071018] text-orange-500">
              {business.logo_url ? (
                <Image alt={`${business.name} logo`} className="object-cover" fill sizes="48px" src={business.logo_url} />
              ) : (
                <Factory aria-hidden className="size-7" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-black text-slate-950">{business.name}</h3>
              <p className="line-clamp-1 text-xs font-semibold text-slate-500">{business.category?.name ?? "خدمات صناعية"} - {business.area}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-black text-slate-950">
              <span>{Number(business.rating_average).toFixed(1)}</span>
              <Star aria-hidden className="size-4 fill-orange-500 text-orange-500" />
            </div>
          </Link>
        ))}
      </div>
      <ButtonLink className="mt-4 w-full" href="/search?sort=top-rated">عرض جميع المحلات</ButtonLink>
    </aside>
  );
}
