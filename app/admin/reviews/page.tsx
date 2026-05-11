import Link from "next/link";
import { deleteReviewAction, moderateReviewAction, moderateReviewReportAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { adminPageSize, getAdminRange, getTotalPages, parseAdminPage } from "@/lib/admin/pagination";
import { dbQuery } from "@/lib/db/postgres";

type AdminReviewsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type ReviewRelation<T> = T[] | T | null;

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  business: ReviewRelation<{ name: string; slug: string }>;
  user: ReviewRelation<{ full_name: string; username: string }>;
};

type ReportRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  review: ReviewRelation<{ id: string; comment: string | null; business: ReviewRelation<{ name: string; slug: string }> }>;
  user: ReviewRelation<{ full_name: string; username: string }>;
};

type ReviewQueryRow = {
  business_name: string | null;
  business_slug: string | null;
  comment: string | null;
  created_at: string;
  id: string;
  rating: number;
  status: string;
  user_full_name: string | null;
  user_username: string | null;
};

type ReportQueryRow = {
  business_name: string | null;
  business_slug: string | null;
  created_at: string;
  id: string;
  reason: string;
  review_comment: string | null;
  review_id: string | null;
  status: string;
  user_full_name: string | null;
  user_username: string | null;
};

function relationOne<T>(relation: ReviewRelation<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function safeSearch(value: string) {
  return value.replace(/[%_,]/g, "").trim();
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const params = await searchParams;
  const page = parseAdminPage(params.page);
  const range = getAdminRange(page);
  const where: string[] = [];
  const values: unknown[] = [];

  if (params.business) {
    values.push(`%${safeSearch(params.business)}%`);
    where.push(`b.name ilike $${values.length}`);
  }

  if (params.user) {
    values.push(`%${safeSearch(params.user)}%`);
    where.push(`(p.full_name ilike $${values.length} or p.username::text ilike $${values.length})`);
  }

  if (params.status) {
    values.push(params.status);
    where.push(`r.status::text = $${values.length}`);
  }

  if (params.rating) {
    values.push(Number(params.rating));
    where.push(`r.rating = $${values.length}`);
  }

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const countResult = await dbQuery<{ count: number }>(
    `
      select count(*)::int as count
      from public.reviews r
      left join public.businesses b on b.id = r.business_id
      left join public.profiles p on p.id = r.user_id
      ${whereSql}
    `,
    values,
  );
  const count = countResult.rows[0]?.count ?? 0;
  const reviewValues = [...values, adminPageSize, range.from];
  const reviewResult = await dbQuery<ReviewQueryRow>(
    `
      select
        r.id::text,
        r.rating,
        r.comment,
        r.status::text,
        r.created_at::text,
        b.name as business_name,
        b.slug as business_slug,
        p.full_name as user_full_name,
        p.username::text as user_username
      from public.reviews r
      left join public.businesses b on b.id = r.business_id
      left join public.profiles p on p.id = r.user_id
      ${whereSql}
      order by r.created_at desc
      limit $${reviewValues.length - 1}
      offset $${reviewValues.length}
    `,
    reviewValues,
  );
  const rows: ReviewRow[] = reviewResult.rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    created_at: row.created_at,
    business: row.business_name && row.business_slug ? { name: row.business_name, slug: row.business_slug } : null,
    user: row.user_full_name && row.user_username ? { full_name: row.user_full_name, username: row.user_username } : null,
  }));

  const reportResult = await dbQuery<ReportQueryRow>(
    `
      select
        rr.id::text,
        rr.reason,
        rr.status::text,
        rr.created_at::text,
        r.id::text as review_id,
        r.comment as review_comment,
        b.name as business_name,
        b.slug as business_slug,
        p.full_name as user_full_name,
        p.username::text as user_username
      from public.review_reports rr
      left join public.reviews r on r.id = rr.review_id
      left join public.businesses b on b.id = r.business_id
      left join public.profiles p on p.id = rr.user_id
      order by rr.created_at desc
      limit 20
    `,
  );
  const reports: ReportRow[] = reportResult.rows.map((row) => ({
    id: row.id,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at,
    review: row.review_id
      ? {
          id: row.review_id,
          comment: row.review_comment,
          business: row.business_name && row.business_slug ? { name: row.business_name, slug: row.business_slug } : null,
        }
      : null,
    user: row.user_full_name && row.user_username ? { full_name: row.user_full_name, username: row.user_username } : null,
  }));

  return (
    <>
      <AdminHeader description="راجع التقييمات واقبلها أو ارفضها أو احذفها عند الحاجة." title="إدارة التقييمات" />

      <form className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.business ?? ""} name="business" placeholder="بحث باسم المحل" />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.user ?? ""} name="user" placeholder="بحث باسم المستخدم" />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="rating" defaultValue={params.rating ?? ""}>
          <option value="">كل التقييمات</option>
          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
        </select>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="status" defaultValue={params.status ?? ""}>
          <option value="">كل الحالات</option>
          <option value="pending">معلق</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
        <button className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
      </form>

      <AdminTable
        headers={["المحل", "المستخدم", "التقييم", "التعليق", "الحالة", "التاريخ", "الإجراءات"]}
        rows={rows.map((review) => {
          const business = relationOne(review.business);
          const user = relationOne(review.user);
          return [
            business ? <Link key="business" className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`}>{business.name}</Link> : "محل محذوف",
            user ? <div key="user"><p className="font-bold text-slate-800">{user.full_name}</p><p className="text-xs text-slate-500">@{user.username}</p></div> : "مستخدم محذوف",
            <span key="rating" className="font-black text-orange-600">{review.rating} / 5</span>,
            <p key="comment" className="max-w-sm whitespace-pre-wrap text-sm leading-7 text-slate-700">{review.comment || "بدون تعليق"}</p>,
            <StatusBadge key="status" status={review.status}>{review.status}</StatusBadge>,
            new Date(review.created_at).toLocaleDateString("ar-SY"),
            <div key="actions" className="flex min-w-64 flex-wrap gap-2">
              <AdminActionForm action={moderateReviewAction}>
                <input name="reviewId" type="hidden" value={review.id} />
                <input name="status" type="hidden" value="approved" />
                <AdminSubmitButton className="rounded-md bg-green-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">قبول</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={moderateReviewAction} confirmMessage="هل تريد رفض هذا التقييم؟">
                <input name="reviewId" type="hidden" value={review.id} />
                <input name="status" type="hidden" value="rejected" />
                <AdminSubmitButton className="rounded-md bg-amber-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">رفض</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={deleteReviewAction} confirmMessage="هل تريد حذف هذا التقييم نهائياً؟">
                <input name="reviewId" type="hidden" value={review.id} />
                <AdminSubmitButton className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">حذف</AdminSubmitButton>
              </AdminActionForm>
            </div>,
          ];
        })}
      />

      <Pagination basePath="/admin/reviews" page={page} searchParams={params} totalPages={getTotalPages(count, adminPageSize)} />

      <div className="mt-8">
        <AdminHeader description="بلاغات المستخدمين على التقييمات، راجعها وأغلقها أو اعتمدها." title="بلاغات التقييمات" />
        <AdminTable
          emptyText="لا توجد بلاغات."
          headers={["المحل", "المستخدم", "السبب", "التقييم", "الحالة", "الإجراءات"]}
          rows={reports.map((report) => {
            const review = relationOne(report.review);
            const business = review ? relationOne(review.business) : null;
            const user = relationOne(report.user);
            return [
              business ? <Link className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`} key="business">{business.name}</Link> : "غير متاح",
              user ? <div key="user"><p className="font-bold">{user.full_name}</p><p className="text-xs text-slate-500">@{user.username}</p></div> : "مستخدم محذوف",
              <p className="max-w-xs whitespace-pre-wrap text-sm text-slate-700" key="reason">{report.reason}</p>,
              <p className="max-w-xs whitespace-pre-wrap text-sm text-slate-500" key="review">{review?.comment ?? "بدون تعليق"}</p>,
              <StatusBadge key="status" status={report.status}>{report.status}</StatusBadge>,
              <div className="grid min-w-64 gap-2" key="actions">
                <AdminActionForm action={moderateReviewReportAction}>
                  <input name="reportId" type="hidden" value={report.id} />
                  <input name="status" type="hidden" value="approved" />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="adminNote" placeholder="ملاحظة إدارية اختيارية" />
                  <AdminSubmitButton className="h-9 rounded-md bg-green-700 px-3 text-xs font-black text-white disabled:opacity-70">قبول البلاغ</AdminSubmitButton>
                </AdminActionForm>
                <AdminActionForm action={moderateReviewReportAction}>
                  <input name="reportId" type="hidden" value={report.id} />
                  <input name="status" type="hidden" value="rejected" />
                  <AdminSubmitButton className="h-9 rounded-md bg-slate-900 px-3 text-xs font-black text-white disabled:opacity-70">إغلاق</AdminSubmitButton>
                </AdminActionForm>
              </div>,
            ];
          })}
        />
      </div>
    </>
  );
}
