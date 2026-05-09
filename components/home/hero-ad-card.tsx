import Link from "next/link";
import Image from "next/image";
import type { HomeAd } from "@/lib/data/marketplace";

export function HeroAdCard({ ad }: { ad?: HomeAd }) {
  return (
    <Link
      className="relative hidden h-[178px] overflow-hidden rounded-lg border border-white/35 bg-[#071018]/95 shadow-lg shadow-black/20 lg:block"
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
          <p className="mt-2 line-clamp-1 text-sm font-bold text-white/80">{ad?.description ?? "تصليح السيارات"}</p>
          <p className="mt-3 text-4xl font-black leading-none text-orange-500">20%</p>
          <span className="mt-4 w-fit rounded-md border border-white/25 px-4 py-1 text-xs font-bold">اعرف المزيد</span>
        </div>
      </div>
    </Link>
  );
}
