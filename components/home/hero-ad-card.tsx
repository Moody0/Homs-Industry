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
        className="relative block h-[210px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#071018] shadow-lg shadow-black/20 min-[390px]:h-[220px]"
        href={ad?.link_url ?? "/categories/cars"}
      >
        <Image
          alt={ad?.alt_text ?? ad?.title ?? "إعلان ورشة الأمان"}
          className="object-contain"
          fill
          sizes="100vw"
          src={ad?.image_url ?? "/images/hero-ad.png"}
        />
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
