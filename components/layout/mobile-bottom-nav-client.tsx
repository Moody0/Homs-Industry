"use client";

import Link from "next/link";
import { Grid2X2, Home, LayoutDashboard, PlusCircle, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const icons = {
  categories: Grid2X2,
  dashboard: LayoutDashboard,
  home: Home,
  plus: PlusCircle,
  search: Search,
} as const;

type MobileBottomNavItem = {
  href: string;
  label: string;
  icon: keyof typeof icons;
};

export function MobileBottomNavClient({ items }: { items: MobileBottomNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-[1200] border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-slate-500 transition hover:text-orange-600",
                isActive && "text-orange-600 after:absolute after:top-0 after:h-1 after:w-8 after:rounded-b-full after:bg-orange-500",
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
