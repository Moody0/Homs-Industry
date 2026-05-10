import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Factory, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { RatingStars } from "@/components/business/rating-stars";
import { formatDistance, type BusinessSummary } from "@/lib/data/marketplace";

type BusinessCardProps = {
  business: BusinessSummary;
};

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      href={`/businesses/${business.slug}`}
    >
      <div className="relative h-40 bg-[#111827] sm:h-44 md:h-36 xl:h-32">
        {business.cover_image_url ? (
          <Image
            alt={business.name}
            className="object-cover opacity-85 transition group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            src={business.cover_image_url}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#1f2933,#071018)]" />
        )}
        <div className="absolute right-3 top-3 flex flex-wrap gap-1">
          {business.is_featured ? <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-black text-white"><Sparkles aria-hidden className="size-3" />متميز</span> : null}
          {business.is_verified ? <span className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[11px] font-black text-white"><CheckCircle2 aria-hidden className="size-3" />موثق</span> : null}
          {business.is_trusted ? <span className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-1 text-[11px] font-black text-white"><ShieldCheck aria-hidden className="size-3" />موثوق</span> : null}
        </div>
        <div className="absolute -bottom-7 left-4 grid size-14 place-items-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
          {business.logo_url ? (
            <Image alt={`${business.name} logo`} className="object-cover" fill sizes="56px" src={business.logo_url} />
          ) : (
            <Factory aria-hidden className="size-8 text-slate-950" />
          )}
        </div>
      </div>
      <div className="space-y-3 p-4 pt-9">
        <div>
          <h3 className="line-clamp-1 text-base font-black text-slate-950 group-hover:text-orange-600">
            {business.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
            {business.subcategory?.name ?? business.category?.name ?? "خدمات صناعية"}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
          <RatingStars rating={business.rating_average} />
          <span>{business.reviews_count} تقييم</span>
        </div>
        <div className="grid gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600 sm:grid-cols-2 md:grid-cols-1">
          <span className="inline-flex items-center gap-2">
            <Phone aria-hidden className="size-4 text-slate-950" />
            {business.phone}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden className="size-4 text-slate-950" />
            {formatDistance(business.distance_km) ? `${formatDistance(business.distance_km)} · ` : ""}حمص - {business.area}
          </span>
        </div>
      </div>
    </Link>
  );
}
