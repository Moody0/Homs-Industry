import Link from "next/link";
import { deleteReviewAction, moderateReviewAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { adminPageSize, getAdminRange, getTotalPages, parseAdminPage } from "@/lib/admin/pagination";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  let businessIds: string[] | null = null;
  let userIds: string[] | null = null;

  if (params.business) {
    const q = safeSearch(params.business);
    const { data } = await supabase.from("businesses").select("id").ilike("name", `%${q}%`).limit(100);
    businessIds = (data ?? []).map((row) => row.id);
  }

  if (params.user) {
    const q = safeSearch(params.user);
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(100);
    userIds = (data ?? []).map((row) => row.id);
  }

  let query = supabase
    .from("reviews")
    .select("id, rating, comment, status, created_at, business:businesses(name, slug), user:profiles(full_name, username)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.rating) query = query.eq("rating", Number(params.rating));
  if (businessIds) query = businessIds.length ? query.in("business_id", businessIds) : query.eq("business_id", "00000000-0000-0000-0000-000000000000");
  if (userIds) query = userIds.length ? query.in("user_id", userIds) : query.eq("user_id", "00000000-0000-0000-0000-000000000000");

  const { count, data: reviews } = await query.range(range.from, range.to);
  const rows = (reviews ?? []) as ReviewRow[];

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
    </>
  );
}
