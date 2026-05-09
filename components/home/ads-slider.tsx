import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { HomeAd } from "@/lib/data/marketplace";

export function AdsSlider({ ads }: { ads: HomeAd[] }) {
  const visibleAds = ads.slice(1, 4);

  return (
    <section className="bg-white py-3 shadow-sm">
      <Container className="flex items-center gap-4" dir="ltr">
        <button aria-label="الإعلان السابق" className="grid size-8 shrink-0 place-items-center rounded-full text-slate-950 transition hover:bg-slate-100" type="button">
          <ChevronLeft aria-hidden className="size-5" strokeWidth={3} />
        </button>
        <div className="grid flex-1 gap-4 md:grid-cols-3">
          {visibleAds.map((ad) => (
            <Link aria-label={ad.title} className="relative block h-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-orange-200 md:h-[74px]" href={ad.link_url ?? "/categories"} key={ad.id}>
              {ad.image_url ? (
                <Image alt={ad.alt_text ?? ad.title} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={ad.image_url} />
              ) : null}
            </Link>
          ))}
        </div>
        <button aria-label="الإعلان التالي" className="grid size-8 shrink-0 place-items-center rounded-full text-slate-950 transition hover:bg-slate-100" type="button">
          <ChevronRight aria-hidden className="size-5" strokeWidth={3} />
        </button>
      </Container>
    </section>
  );
}
