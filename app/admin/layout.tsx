import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
