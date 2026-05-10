import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Megaphone } from "lucide-react";
import type { HomeAd } from "@/lib/data/marketplace";

type HeroAdCardProps = {
  ad?: HomeAd;
  variant?: "desktop" | "mobile";
};

export function HeroAdCard({ ad, variant = "desktop" }: HeroAdCardProps) {
  const isMobile = variant === "mobile";

  if (isMobile) {
    return (
      <Link
        aria-label={ad?.title ?? "إعلان ورشة الأمان"}
        className="group block w-full overflow-hidden rounded-xl border border-white/15 bg-white text-slate-950 shadow-2xl shadow-black/25"
        href={ad?.link_url ?? "/categories/cars"}
      >
        <div className="relative aspect-[16/9] bg-[#111827]">
          <Image
            alt={ad?.alt_text ?? ad?.title ?? "إعلان صناعي"}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="100vw"
            src={ad?.image_url ?? "/images/hero-ad.png"}
          />
          <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" aria-hidden />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-black text-white">
            <Megaphone aria-hidden className="size-3.5" />
            إعلان
          </span>
        </div>
        <div className="grid gap-3 px-4 py-4 text-right">
          <div className="min-w-0">
            <p className="line-clamp-1 text-xl font-black leading-tight">{ad?.title ?? "ورشة الأمان"}</p>
            <p className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-slate-500">{ad?.description ?? "لتصليح السيارات"}</p>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs font-black text-orange-600">إعلان مميز</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white">
              اعرف المزيد
              <ArrowLeft aria-hidden className="size-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className="group relative hidden min-h-[360px] overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-2xl shadow-black/25 backdrop-blur lg:block"
      href={ad?.link_url ?? "/categories/cars"}
    >
      <div className="relative h-48 bg-[#111827]">
        <Image
          alt={ad?.alt_text ?? ad?.title ?? "إعلان صناعي"}
          className="object-cover transition duration-300 group-hover:scale-105"
          fill
          sizes="400px"
          src={ad?.image_url ?? "/images/hero-ad.png"}
        />
        <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071018] to-transparent" aria-hidden />
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-black text-white">
          <Megaphone aria-hidden className="size-3.5" />
          إعلان مميز
        </span>
      </div>
      <div className="p-5 text-right">
        <p className="line-clamp-2 text-2xl font-black leading-tight text-white">{ad?.title ?? "ورشة الأمان"}</p>
        <p className="mt-3 line-clamp-2 text-sm font-bold leading-7 text-white/72">{ad?.description ?? "لتصليح السيارات"}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs font-black text-orange-200">مساحة إعلانية</span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-black text-slate-950 transition group-hover:bg-orange-500 group-hover:text-white">
            اعرف المزيد
            <ArrowLeft aria-hidden className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
