import Image from "next/image";
import { BadgeCheck, CheckCircle2, MapPin, ShieldCheck, Star } from "lucide-react";
import { ContactButtons } from "@/components/business/contact-buttons";
import { FavoriteButton } from "@/components/business/favorite-button";
import { RatingStars } from "@/components/business/rating-stars";
import { ShareButton } from "@/components/business/share-button";
import { Container } from "@/components/ui/container";
import type { BusinessSummary } from "@/lib/data/marketplace";

type BusinessHeaderProps = {
  business: BusinessSummary;
  cover?: string | null;
  isFavorite: boolean;
  isAuthenticated: boolean;
};

export function BusinessHeader({ business, cover, isFavorite, isAuthenticated }: BusinessHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-[#071018] text-white">
      <div className="industrial-hero-overlay absolute inset-0" />
      {cover ? <Image alt={business.name} className="object-cover opacity-35 md:opacity-40" fill fetchPriority="high" sizes="100vw" src={cover} /> : null}
      <Container className="relative pb-7 pt-9 md:py-16">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {business.is_featured ? <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1 text-xs font-black"><BadgeCheck className="size-4" /> مميز</span> : null}
            {business.is_verified ? <span className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-xs font-black"><CheckCircle2 className="size-4" /> موثق</span> : null}
            {business.is_trusted ? <span className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-black text-slate-950"><ShieldCheck className="size-4" /> موثوق</span> : null}
            {business.status !== "approved" ? <span className="rounded-md bg-amber-500 px-3 py-1 text-xs font-black">بانتظار المراجعة</span> : null}
          </div>
          <div>
            <p className="text-sm font-black text-orange-300">{business.subcategory?.name ?? business.category?.name ?? "خدمات صناعية"}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{business.name}</h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/75">{business.description}</p>
          <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-bold text-white/85 sm:gap-4">
            <span className="inline-flex items-center gap-2"><RatingStars rating={business.rating_average} valueClassName="text-white/85" /></span>
            <span className="inline-flex items-center gap-2"><Star className="size-4 text-orange-500" /> {business.reviews_count} تقييم</span>
            <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-orange-500" /> {business.address}</span>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <ContactButtons
              businessId={business.id}
              buttonClassName="flex-1 px-2 sm:flex-none sm:px-4"
              className="w-full sm:w-auto"
              phone={business.phone}
              whatsappPhone={business.whatsapp_phone}
            >
              <ShareButton className="flex-1 px-2 sm:flex-none sm:px-4" inline title={business.name} />
            </ContactButtons>
            <FavoriteButton businessId={business.id} disabled={!isAuthenticated} isFavorite={isFavorite} />
          </div>
        </div>
      </Container>
    </section>
  );
}
