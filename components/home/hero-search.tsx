import Link from "next/link";
import { LocateFixed } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HeroAdCard } from "@/components/home/hero-ad-card";
import { SearchSuggestionsInput } from "@/components/search/search-suggestions-input";
import type { HomeAd, HomeHeroSettings } from "@/lib/data/marketplace";

const quickLinks = [
  { href: "/search?category=cars", label: "سيارات" },
  { href: "/search?category=carpentry", label: "نجارين" },
  { href: "/search?category=welding", label: "حدادة ولحام" },
  { href: "/search?near=1&sort=distance", label: "قريب مني", icon: LocateFixed },
];

export function HeroSearch({ ad, hero }: { ad?: HomeAd; hero: HomeHeroSettings }) {
  return (
    <section className="relative isolate z-20 bg-[#071018] text-white">
      <div
        aria-label={hero.alt_text ?? "خلفية خدمات صناعية في حمص"}
        className="absolute inset-0 -z-20 bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url("${hero.image_url}")` }}
      />
      <span className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,16,24,0.84),rgba(7,16,24,0.72)_45%,rgba(7,16,24,0.96))] md:bg-[linear-gradient(90deg,rgba(7,16,24,0.96),rgba(7,16,24,0.82)_48%,rgba(7,16,24,0.46))]" aria-hidden />

      <Container className="grid min-h-[560px] items-center gap-7 py-7 sm:min-h-[590px] sm:py-9 lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:py-10 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="w-full max-w-4xl text-right">
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            اعثر على أفضل ورشة أو محل
            <span className="block pt-2 text-orange-400">في حمص خلال ثواني</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-bold leading-8 text-white/78 sm:text-base">
            ابحث عن الخدمات الصناعية، قارن التقييمات، واعرف الأقرب إليك بدون تضييع وقت.
          </p>

          <SearchSuggestionsInput
            buttonLabel="بحث"
            className="mt-6 w-full rounded-xl border border-white/15 bg-white/95 shadow-2xl shadow-black/25 backdrop-blur md:max-w-3xl"
            inputPlaceholder="ابحث عن خدمة، محل، منتج..."
            showAreaField
          />

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:border-orange-300/60 hover:bg-orange-500/20" href={item.href} key={item.href}>
                  {Icon ? <Icon aria-hidden className="size-4 text-orange-300" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 w-full text-right lg:hidden">
            <HeroAdCard ad={ad} variant="mobile" />
          </div>
        </div>

        <HeroAdCard ad={ad} />
      </Container>
    </section>
  );
}
