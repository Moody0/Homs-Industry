"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileChartColumn, Grid2X2, Megaphone, MessageSquareText, Settings, Store, Tags, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "لوحة التحكم", icon: BarChart3 },
  { href: "/admin/businesses", label: "المحلات", icon: Store },
  { href: "/admin/categories", label: "الفئات", icon: Grid2X2 },
  { href: "/admin/subcategories", label: "الفئات الفرعية", icon: Tags },
  { href: "/admin/ads", label: "الإعلانات", icon: Megaphone },
  { href: "/admin/reviews", label: "التقييمات", icon: MessageSquareText },
  { href: "/admin/reports", label: "التقارير", icon: FileChartColumn },
  { href: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <div className="mb-4 border-b border-slate-100 pb-4">
          <p className="text-xs font-black text-orange-600">لوحة الإدارة</p>
          <p className="mt-1 text-lg font-black text-slate-950">التحكم والمراجعة</p>
        </div>
        <nav className="grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 transition",
                  active ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "hover:bg-orange-50 hover:text-orange-700",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <nav className="sticky top-16 z-[1100] -mx-3 flex gap-2 overflow-x-auto border-y border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:-mx-5 sm:px-5 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-black transition",
                active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
