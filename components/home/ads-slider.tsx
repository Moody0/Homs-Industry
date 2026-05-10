import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { HomeAd } from "@/lib/data/marketplace";

export function AdsSlider({ ads }: { ads: HomeAd[] }) {
  const visibleAds = ads.slice(1, 4);

  return (
    <section className="bg-white py-4 shadow-sm">
      <Container className="flex items-center gap-3 md:gap-4" dir="ltr">
        <button aria-label="الإعلان السابق" className="hidden size-8 shrink-0 place-items-center rounded-full text-slate-950 transition hover:bg-slate-100 md:grid" type="button">
          <ChevronLeft aria-hidden className="size-5" strokeWidth={3} />
        </button>
        <div className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
          {visibleAds.map((ad) => (
            <Link aria-label={ad.title} className="relative block h-28 min-w-[85vw] snap-start overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-orange-200 sm:min-w-[65vw] md:h-[74px] md:min-w-0" href={ad.link_url ?? "/categories"} key={ad.id}>
              {ad.image_url ? (
                <Image alt={ad.alt_text ?? ad.title} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={ad.image_url} />
              ) : null}
            </Link>
          ))}
        </div>
        <button aria-label="الإعلان التالي" className="hidden size-8 shrink-0 place-items-center rounded-full text-slate-950 transition hover:bg-slate-100 md:grid" type="button">
          <ChevronRight aria-hidden className="size-5" strokeWidth={3} />
        </button>
      </Container>
    </section>
  );
}
