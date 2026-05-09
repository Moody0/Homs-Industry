import { MapPin, Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HeroAdCard } from "@/components/home/hero-ad-card";
import type { HomeAd, HomeHeroSettings } from "@/lib/data/marketplace";

export function HeroSearch({ ad, hero }: { ad?: HomeAd; hero: HomeHeroSettings }) {
  return (
    <section className="relative overflow-hidden bg-[#071018] text-white">
      <div
        aria-label={hero.alt_text ?? "خلفية خدمات صناعية في حمص"}
        className="absolute inset-0 bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url("${hero.image_url}")` }}
      />

      <Container className="relative grid min-h-[260px] items-center gap-6 py-8 lg:grid-cols-[1fr_290px]">
        <div className="mx-auto w-full max-w-4xl text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.72)]">
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            كل ما تحتاجه من
            <span className="block pt-2 text-orange-500">خدمات صناعية في حمص</span>
          </h1>

          <form action="/search" className="mx-auto mt-7 grid w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-white text-slate-900 shadow-lg shadow-black/20 md:grid-cols-[minmax(0,1.35fr)_minmax(170px,0.7fr)_64px]">
            <label className="flex min-h-12 items-center gap-2 border-b border-slate-200 px-4 md:border-b-0 md:border-l">
              <MapPin aria-hidden className="size-4 text-slate-500" />
              <span className="sr-only">الخدمة أو المحل</span>
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" name="q" placeholder="ابحث عن خدمة أو محل ..." type="search" />
            </label>
            <label className="flex min-h-12 items-center gap-2 border-b border-slate-200 px-4 md:border-b-0 md:border-l">
              <MapPin aria-hidden className="size-4 text-slate-500" />
              <span className="sr-only">الموقع</span>
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" name="area" placeholder="كل حمص" type="search" />
            </label>
            <button className="grid min-h-12 place-items-center bg-orange-500 text-white transition hover:bg-orange-600" type="submit">
              <Search aria-hidden className="size-6" />
              <span className="sr-only">بحث</span>
            </button>
          </form>
        </div>
        <HeroAdCard ad={ad} />
      </Container>
    </section>
  );
}
