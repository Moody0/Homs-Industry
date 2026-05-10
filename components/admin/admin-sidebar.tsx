import Link from "next/link";
import { BarChart3, FileChartColumn, Grid2X2, Megaphone, MessageSquareText, Settings, Store, Tags, Users } from "lucide-react";

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
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <nav className="grid gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-700" href={item.href} key={item.href}>
              <Icon aria-hidden className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
