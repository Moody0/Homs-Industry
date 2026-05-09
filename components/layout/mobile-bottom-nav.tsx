import Link from "next/link";
import { Grid2X2, Heart, Home, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "الرئيسية", icon: Home, active: true },
  { href: "/categories", label: "الفئات", icon: Grid2X2 },
  { href: "/search", label: "بحث", icon: Search },
  { href: "/favorites", label: "المفضلة", icon: Heart },
  { href: "/login", label: "حسابي", icon: UserRound },
];

export function MobileBottomNav() {
  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-slate-500 transition hover:text-orange-600",
                item.active && "text-orange-600",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
