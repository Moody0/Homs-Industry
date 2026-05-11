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
      <div className="mt-6">
        <AdminTable
          headers={["المحل", "الحالة", "تاريخ الإضافة"]}
          rows={(recentBusinesses.data ?? []).map((business) => [
            business.name,
            <StatusBadge key="status" status={business.status}>{business.status}</StatusBadge>,
            new Date(business.created_at).toLocaleDateString("ar-SY"),
          ])}
        />
      </div>
    </>
  );
}
