import Link from "next/link";
import { ArrowLeft, Clock, Megaphone, MessageSquareText, Store } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = await createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const [users, businesses, pendingBusinesses, reviews, activeAds, recentBusinesses] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("businesses").select("id", { count: "exact", head: true }),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("ads").select("id", { count: "exact", head: true }).eq("is_active", true).lte("start_date", today).gte("end_date", today),
    supabase
      .from("businesses")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const quickActions = [
    { href: "/admin/businesses?status=pending", label: "مراجعة الطلبات", value: pendingBusinesses.count ?? 0, icon: Clock },
    { href: "/admin/businesses", label: "إدارة المحلات", value: businesses.count ?? 0, icon: Store },
    { href: "/admin/reviews", label: "التقييمات", value: reviews.count ?? 0, icon: MessageSquareText },
    { href: "/admin/ads", label: "الإعلانات", value: activeAds.count ?? 0, icon: Megaphone },
  ];

  return (
    <>
      <AdminHeader description="نظرة سريعة على نشاط منصة صناعة حمص." title="لوحة التحكم" />
      <AdminStatsCards
        stats={[
          { label: "المستخدمون", value: users.count ?? 0 },
          { label: "المحلات", value: businesses.count ?? 0 },
          { label: "طلبات معلقة", value: pendingBusinesses.count ?? 0 },
          { label: "التقييمات", value: reviews.count ?? 0 },
          { label: "إعلانات فعالة", value: activeAds.count ?? 0 },
        ]}
      />

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link className="group grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md" href={action.href} key={action.href}>
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-orange-50 text-orange-600">
                  <Icon aria-hidden className="size-5" />
                </span>
                <ArrowLeft aria-hidden className="size-5 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">{action.label}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{action.value} عنصر</p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-orange-600">آخر النشاط</p>
            <h2 className="text-xl font-black text-slate-950">أحدث المحلات</h2>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700" href="/admin/businesses">
            عرض الكل
            <ArrowLeft aria-hidden className="size-4" />
          </Link>
        </div>
        <AdminTable
          headers={["المحل", "الحالة", "تاريخ الإضافة"]}
          rows={(recentBusinesses.data ?? []).map((business) => [
            business.name,
            <StatusBadge key="status" status={business.status}>{business.status}</StatusBadge>,
            new Date(business.created_at).toLocaleDateString("ar-SY"),
          ])}
        />
      </section>
    </>
  );
}
