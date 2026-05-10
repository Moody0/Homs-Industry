import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, PlusCircle, Store } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";

const items = [
  { href: "/dashboard", label: "محلاتي", icon: Store },
  { href: "/add-business", label: "إضافة محل", icon: PlusCircle },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 pb-24 pt-5 sm:px-4 sm:py-8 lg:grid-cols-[240px_1fr] lg:py-10">
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm font-black text-slate-950">
          <BarChart3 aria-hidden className="size-4 text-orange-600" />
          لوحة صاحب المحل
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-orange-50 hover:text-orange-700 lg:bg-transparent" href={item.href} key={item.href}>
                <Icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
