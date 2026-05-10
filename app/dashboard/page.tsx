import Link from "next/link";
import { CalendarDays, Eye, Heart, MessageSquareText, MousePointerClick, Star, Store } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_trusted: boolean;
  rating_average: number | string;
  reviews_count: number;
  created_at: string;
};

function Stat({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: number | string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-3 sm:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700 sm:size-11">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-black text-slate-950">{value}</p>
          <p className="text-[11px] font-bold leading-5 text-slate-500 sm:text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TrustBadges({ business }: { business: BusinessRow }) {
  return (
    <div className="flex flex-wrap gap-1">
      {business.is_featured ? <StatusBadge status="approved">متميز</StatusBadge> : null}
      {business.is_verified ? <StatusBadge status="approved">موثق</StatusBadge> : null}
      {business.is_trusted ? <StatusBadge status="approved">موثوق</StatusBadge> : null}
      {!business.is_featured && !business.is_verified && !business.is_trusted ? <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">بدون شارات</span> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, slug, status, is_featured, is_verified, is_trusted, rating_average, reviews_count, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const businessRows = (businesses ?? []) as BusinessRow[];
  const ids = businessRows.map((business) => business.id);

  const [analyticsResult, favoritesResult] = await Promise.all([
    ids.length
      ? supabase
          .from("business_analytics_daily")
          .select("views, call_clicks, whatsapp_clicks, direction_clicks, profile_clicks, inquiries")
          .in("business_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("favorites").select("business_id").in("business_id", ids) : Promise.resolve({ data: [] }),
  ]);

  const totals = (analyticsResult.data ?? []).reduce(
    (acc, row) => ({
      clicks: acc.clicks + Number(row.call_clicks ?? 0) + Number(row.whatsapp_clicks ?? 0) + Number(row.direction_clicks ?? 0) + Number(row.profile_clicks ?? 0),
      inquiries: acc.inquiries + Number(row.inquiries ?? 0),
      views: acc.views + Number(row.views ?? 0),
    }),
    { clicks: 0, inquiries: 0, views: 0 },
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-lg bg-[#071018] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-orange-400">لوحة صاحب المحل</p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">تابع محلاتك بسهولة</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-white/70">عدّل البيانات، راقب الأداء، ورد على التقييمات من مكان واحد.</p>
          </div>
          <ButtonLink className="w-full bg-orange-500 text-white hover:bg-orange-600 sm:w-auto" href="/add-business">إضافة محل</ButtonLink>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat icon={Store} label="عدد المحلات" value={businessRows.length} />
        <Stat icon={Eye} label="مشاهدات" value={totals.views} />
        <Stat icon={MousePointerClick} label="نقرات وتواصل" value={totals.clicks} />
        <Stat icon={Heart} label="إضافات للمفضلة" value={favoritesResult.data?.length ?? 0} />
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <h2 className="text-xl font-black text-slate-950">محلاتي</h2>
        </CardHeader>
        <CardContent>
          <AdminTable
            emptyText="لا توجد محلات بعد."
            headers={["المحل", "الحالة", "الثقة", "التقييم", "التاريخ", "الإدارة"]}
            rows={businessRows.map((business) => [
              <Link className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`} key="name">{business.name}</Link>,
              <StatusBadge key="status" status={business.status}>{business.status}</StatusBadge>,
              <TrustBadges business={business} key="trust" />,
              <span className="text-xs font-bold text-slate-700" key="rating">{Number(business.rating_average).toFixed(1)} / 5 · {business.reviews_count} تقييم</span>,
              new Date(business.created_at).toLocaleDateString("ar-SY"),
              <div className="flex flex-wrap gap-2" key="actions">
                <ButtonLink href={`/dashboard/businesses/${business.id}`} size="sm" variant="outline">إدارة</ButtonLink>
                <ButtonLink href={`/dashboard/businesses/${business.id}#reviews`} size="sm" variant="ghost"><MessageSquareText aria-hidden className="size-4" /> التقييمات</ButtonLink>
              </div>,
            ])}
          />
        </CardContent>
      </Card>

      <section className="space-y-3 md:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">محلاتي</h2>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{businessRows.length} محل</span>
        </div>

        {businessRows.length ? (
          <div className="grid gap-3">
            {businessRows.map((business) => (
              <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={business.id}>
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link className="line-clamp-1 text-lg font-black text-slate-950" href={`/businesses/${business.slug}`}>
                        {business.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={business.status}>{business.status}</StatusBadge>
                        <TrustBadges business={business} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 text-xs font-bold text-slate-600">
                  <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Star aria-hidden className="size-4 fill-orange-500 text-orange-500" />
                    {Number(business.rating_average).toFixed(1)} · {business.reviews_count} تقييم
                  </p>
                  <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <CalendarDays aria-hidden className="size-4 text-slate-500" />
                    {new Date(business.created_at).toLocaleDateString("ar-SY")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
                  <ButtonLink href={`/dashboard/businesses/${business.id}`} size="sm" variant="secondary">إدارة</ButtonLink>
                  <ButtonLink href={`/dashboard/businesses/${business.id}#reviews`} size="sm" variant="outline">
                    <MessageSquareText aria-hidden className="size-4" />
                    التقييمات
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <Store aria-hidden className="mx-auto size-10 text-slate-300" />
            <h3 className="mt-3 text-lg font-black text-slate-950">لا توجد محلات بعد</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">أضف محلك الأول ليظهر في الدليل بعد المراجعة.</p>
            <ButtonLink className="mt-4 w-full" href="/add-business">إضافة محل</ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}
