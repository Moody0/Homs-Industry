import Link from "next/link";
import { moderateCertificateAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { createClient } from "@/lib/supabase/server";

type Relation<T> = T[] | T | null;

function one<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [
    analyticsResult,
    newListings,
    favorites,
    topBusinesses,
    categoryDemand,
    pendingCertificates,
  ] = await Promise.all([
    supabase.from("business_analytics_daily").select("views, call_clicks, whatsapp_clicks, direction_clicks, profile_clicks, inquiries").gte("event_date", monthStartIso),
    supabase.from("businesses").select("id", { count: "exact", head: true }).gte("created_at", monthStartIso),
    supabase.from("favorites").select("business_id"),
    supabase.from("businesses").select("name, slug, rating_average, reviews_count, is_verified, is_trusted").eq("status", "approved").order("rating_average", { ascending: false }).order("reviews_count", { ascending: false }).limit(10),
    supabase.from("businesses").select("category:categories(name)").eq("status", "approved"),
    supabase.from("business_certificates").select("id, title, description, file_url, status, business:businesses(id, name, slug)").eq("status", "pending").order("created_at", { ascending: false }).limit(20),
  ]);

  const analytics = (analyticsResult.data ?? []).reduce(
    (acc, row) => ({
      clicks: acc.clicks + Number(row.call_clicks ?? 0) + Number(row.whatsapp_clicks ?? 0) + Number(row.direction_clicks ?? 0) + Number(row.profile_clicks ?? 0),
      inquiries: acc.inquiries + Number(row.inquiries ?? 0),
      views: acc.views + Number(row.views ?? 0),
    }),
    { clicks: 0, inquiries: 0, views: 0 },
  );

  const categoryCounts = new Map<string, number>();
  for (const row of categoryDemand.data ?? []) {
    const category = one(row.category);
    const name = category?.name ?? "غير مصنف";
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }
  return (
    <div className="space-y-6">
      <AdminHeader description="تقارير الأداء والثقة والطلب داخل المنصة." title="تقارير الإدارة" />

      <AdminStatsCards
        stats={[
          { label: "مشاهدات هذا الشهر", value: analytics.views },
          { label: "نقرات وتفاعل", value: analytics.clicks },
          { label: "استفسارات", value: analytics.inquiries },
          { label: "محلات جديدة", value: newListings.count ?? 0 },
          { label: "المفضلة", value: favorites.data?.length ?? 0 },
        ]}
      />

      <AdminTable
        headers={["الفئة", "عدد المحلات"]}
        rows={[...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => [name, <span className="font-black text-slate-950" key="count">{count}</span>])}
      />

      <AdminTable
        headers={["المحل", "التقييم", "الثقة"]}
        rows={(topBusinesses.data ?? []).map((business) => [
          <Link className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`} key="name">{business.name}</Link>,
          <span className="text-xs font-bold text-slate-700" key="rating">{Number(business.rating_average).toFixed(1)} / 5 · {business.reviews_count} تقييم</span>,
          <div className="flex flex-wrap gap-1" key="trust">
            {business.is_verified ? <StatusBadge status="approved">موثق</StatusBadge> : null}
            {business.is_trusted ? <StatusBadge status="approved">موثوق</StatusBadge> : null}
          </div>,
        ])}
      />

      <AdminTable
        emptyText="لا توجد شهادات بانتظار الموافقة."
        headers={["المحل", "الشهادة", "الوصف", "الإجراءات"]}
        rows={(pendingCertificates.data ?? []).map((certificate) => {
          const business = one(certificate.business);
          return [
            business ? <Link className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`} key="business">{business.name}</Link> : "محل محذوف",
            <a className="font-bold text-orange-600" href={certificate.file_url} key="certificate" rel="noreferrer" target="_blank">{certificate.title}</a>,
            <span className="text-sm text-slate-600" key="description">{certificate.description ?? "بدون وصف"}</span>,
            <div className="flex min-w-48 flex-wrap gap-2" key="actions">
              <AdminActionForm action={moderateCertificateAction}>
                <input name="certificateId" type="hidden" value={certificate.id} />
                <input name="status" type="hidden" value="approved" />
                <AdminSubmitButton className="rounded-md bg-green-700 px-3 py-1 text-xs font-black text-white disabled:opacity-70">قبول</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={moderateCertificateAction}>
                <input name="certificateId" type="hidden" value={certificate.id} />
                <input name="status" type="hidden" value="rejected" />
                <AdminSubmitButton className="rounded-md bg-amber-700 px-3 py-1 text-xs font-black text-white disabled:opacity-70">رفض</AdminSubmitButton>
              </AdminActionForm>
            </div>,
          ];
        })}
      />
    </div>
  );
}
