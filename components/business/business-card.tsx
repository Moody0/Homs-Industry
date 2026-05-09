import Image from "next/image";
import Link from "next/link";
import { Factory, MapPin, Phone } from "lucide-react";
import { RatingStars } from "@/components/business/rating-stars";
import type { BusinessSummary } from "@/lib/data/marketplace";

type BusinessCardProps = {
  business: BusinessSummary;
};

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      href={`/businesses/${business.slug}`}
    >
      <div className="relative h-32 bg-[#111827]">
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
        <div className="flex items-center justify-between text-xs text-slate-600">
          <RatingStars rating={business.rating_average} />
          <span>{business.reviews_count} تقييم</span>
        </div>
        <div className="grid gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Phone aria-hidden className="size-4 text-slate-950" />
            {business.phone}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden className="size-4 text-slate-950" />
            حمص - {business.area}
          </span>
        </div>
      </div>
    </Link>
  );
}
