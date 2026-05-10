import Link from "next/link";
import Image from "next/image";
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
        className="block w-full overflow-hidden rounded-lg border border-white/20 bg-white text-slate-950 shadow-xl shadow-black/25"
        href={ad?.link_url ?? "/categories/cars"}
      >
        <div className="relative aspect-[16/9] bg-[#111827]">
          <Image
            alt={ad?.alt_text ?? ad?.title ?? "إعلان صناعي"}
            className="object-cover"
            fill
            sizes="100vw"
            src={ad?.image_url ?? "/images/hero-ad.png"}
          />
          <span className="absolute right-3 top-3 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-black text-white">إعلان</span>
        </div>
        <div className="grid gap-2 px-4 py-3 text-right">
          <div className="min-w-0">
            <p className="line-clamp-1 text-lg font-black leading-tight">{ad?.title ?? "ورشة الأمان"}</p>
            <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-500">{ad?.description ?? "لتصليح السيارات"}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl font-black leading-none text-orange-500">20% <span className="text-sm text-orange-400">نزلة</span></p>
            <span className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-black text-white">اعرف المزيد</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className="relative hidden h-[178px] overflow-hidden rounded-lg border border-white/25 bg-[#071018] shadow-lg shadow-black/20 lg:block"
      href={ad?.link_url ?? "/categories/cars"}
    >
      <div className="grid h-full grid-cols-[112px_1fr]">
        <div className="relative bg-[#111827]">
          <Image
            alt={ad?.alt_text ?? ad?.title ?? "إعلان صناعي"}
            className="object-cover"
            fill
            sizes="112px"
            src={ad?.image_url ?? "/images/hero-ad.png"}
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center px-5 text-right">
          <p className="line-clamp-1 text-2xl font-black leading-tight">{ad?.title ?? "ورشة الأمان"}</p>
          <p className="mt-2 line-clamp-1 text-sm font-bold text-white/80">{ad?.description ?? "لتصليح السيارات"}</p>
          <p className="mt-3 text-4xl font-black leading-none text-orange-500">20% <span className="text-base text-orange-400">نزلة</span></p>
          <span className="mt-4 w-fit rounded-md border border-white/25 px-4 py-1 text-xs font-bold">اعرف المزيد</span>
        </div>
      </div>
    </Link>
  );
}
