import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-slate-50">
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-3 py-4 pb-24 sm:px-5 sm:py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-8">
        <AdminSidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </section>
  );
}
