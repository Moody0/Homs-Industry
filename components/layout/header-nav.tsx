"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative px-4 py-7 text-sm font-bold text-white/80 transition hover:text-white",
              isActive && "text-white after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-orange-500",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
