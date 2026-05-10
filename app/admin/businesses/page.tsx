import Link from "next/link";
import {
  approveBusinessAction,
  deleteBusinessAction,
  rejectBusinessAction,
  toggleBusinessTrustedAction,
  toggleBusinessFeaturedAction,
  toggleBusinessVerifiedAction,
  updateBusinessAction,
} from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { adminPageSize, getAdminRange, getTotalPages, parseAdminPage } from "@/lib/admin/pagination";
import { createClient } from "@/lib/supabase/server";

type AdminBusinessesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type RelationName = { name: string }[] | { name: string } | null;
type OwnerRelation = { full_name: string; username: string }[] | { full_name: string; username: string } | null;

type AdminBusinessRow = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  area: string;
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_trusted: boolean;
  rating_average: number | string;
  reviews_count: number;
  rejection_reason: string | null;
  created_at: string;
  category: RelationName;
  owner: OwnerRelation;
};

function relationName(relation: RelationName) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name;
}

function ownerName(relation: OwnerRelation) {
  const owner = Array.isArray(relation) ? relation[0] : relation;
  return owner ? `${owner.full_name} (@${owner.username})` : "بدون مالك";
}

function safeSearch(value: string) {
  return value.replace(/[%_,]/g, "").trim();
}

export default async function AdminBusinessesPage({ searchParams }: AdminBusinessesPageProps) {
  const params = await searchParams;
  const page = parseAdminPage(params.page);
  const range = getAdminRange(page);
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  let query = supabase
    .from("businesses")
    .select(
      "id, name, slug, phone, area, status, is_featured, is_verified, is_trusted, rating_average, reviews_count, rejection_reason, created_at, category:categories(name), owner:profiles!businesses_owner_id_fkey(full_name, username)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.category) query = query.eq("category_id", params.category);
  if (params.q) {
    const q = safeSearch(params.q);
    if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,area.ilike.%${q}%`);
  }

  const { count, data } = await query.range(range.from, range.to);
  const businesses = (data ?? []) as AdminBusinessRow[];

  return (
    <>
      <AdminHeader
        description="راجع الطلبات وعدّل حالة المحلات وظهورها في الموقع."
        title="إدارة المحلات"
      />

      <form className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.q ?? ""} name="q" placeholder="بحث بالاسم أو الهاتف أو المنطقة" />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.status ?? ""} name="status">
          <option value="">كل الحالات</option>
          <option value="pending">معلق</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.category ?? ""} name="category">
          <option value="">كل الفئات</option>
          {(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <button className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
      </form>

      <AdminTable
        headers={["المحل", "المالك", "التصنيف", "الحالة", "التقييم", "الهاتف والموقع", "الإجراءات"]}
        rows={businesses.map((business) => [
          <div key="name" className="min-w-56">
            <Link className="font-black text-slate-950 hover:text-orange-600" href={`/businesses/${business.slug}`}>{business.name}</Link>
            <p className="mt-1 text-xs text-slate-500">أضيف في {new Date(business.created_at).toLocaleDateString("ar-SY")}</p>
            {business.rejection_reason ? <p className="mt-1 text-xs font-bold text-red-600">سبب الرفض: {business.rejection_reason}</p> : null}
          </div>,
          <span key="owner" className="text-xs font-semibold text-slate-600">{ownerName(business.owner)}</span>,
          relationName(business.category),
          <div key="status" className="grid gap-1">
            <StatusBadge status={business.status}>{business.status}</StatusBadge>
            <StatusBadge status={business.is_featured ? "approved" : "inactive"}>{business.is_featured ? "مميز" : "غير مميز"}</StatusBadge>
            <StatusBadge status={business.is_verified ? "approved" : "inactive"}>{business.is_verified ? "موثق" : "غير موثق"}</StatusBadge>
            <StatusBadge status={business.is_trusted ? "approved" : "inactive"}>{business.is_trusted ? "موثوق" : "غير موثوق"}</StatusBadge>
          </div>,
          <div key="rating" className="text-xs font-bold text-slate-700">
            {Number(business.rating_average).toFixed(1)} / 5
            <p className="text-slate-500">{business.reviews_count} تقييم</p>
          </div>,
          <div key="contact" className="min-w-40 text-xs font-semibold text-slate-600">
            <p dir="ltr">{business.phone}</p>
            <p>{business.area}</p>
          </div>,
          <div className="grid min-w-80 gap-2" key="actions">
            <div className="flex flex-wrap gap-2">
              <AdminActionForm action={approveBusinessAction}>
                <input name="businessId" type="hidden" value={business.id} />
                <AdminSubmitButton className="rounded-md bg-green-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">قبول</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={toggleBusinessFeaturedAction}>
                <input name="businessId" type="hidden" value={business.id} />
                <input name="isFeatured" type="hidden" value={String(business.is_featured)} />
                <AdminSubmitButton className="rounded-md bg-slate-900 px-3 py-1 text-xs font-black text-white disabled:opacity-70">{business.is_featured ? "إلغاء التمييز" : "تمييز"}</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={toggleBusinessVerifiedAction}>
                <input name="businessId" type="hidden" value={business.id} />
                <input name="isVerified" type="hidden" value={String(business.is_verified)} />
                <AdminSubmitButton className="rounded-md bg-green-700 px-3 py-1 text-xs font-black text-white disabled:opacity-70">{business.is_verified ? "إلغاء التوثيق" : "توثيق"}</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={toggleBusinessTrustedAction}>
                <input name="businessId" type="hidden" value={business.id} />
                <input name="isTrusted" type="hidden" value={String(business.is_trusted)} />
                <AdminSubmitButton className="rounded-md bg-indigo-700 px-3 py-1 text-xs font-black text-white disabled:opacity-70">{business.is_trusted ? "إلغاء موثوق" : "موثوق"}</AdminSubmitButton>
              </AdminActionForm>
              <AdminActionForm action={deleteBusinessAction} confirmMessage={`هل تريد حذف المحل "${business.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}>
                <input name="businessId" type="hidden" value={business.id} />
                <AdminSubmitButton className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">حذف</AdminSubmitButton>
              </AdminActionForm>
            </div>
            <details className="rounded-md border border-slate-200 p-2">
              <summary className="cursor-pointer text-xs font-black text-slate-700">رفض مع سبب</summary>
              <AdminActionForm action={rejectBusinessAction} className="mt-2 grid gap-2" confirmMessage="هل تريد رفض هذا المحل؟">
                <input name="businessId" type="hidden" value={business.id} />
                <textarea className="min-h-20 rounded-md border border-slate-200 px-2 py-2 text-xs" name="rejectionReason" placeholder="اكتب سبب الرفض" required />
                <AdminSubmitButton className="h-9 rounded-md bg-amber-600 text-xs font-black text-white disabled:opacity-70">رفض المحل</AdminSubmitButton>
              </AdminActionForm>
            </details>
            <details className="rounded-md border border-slate-200 p-2">
              <summary className="cursor-pointer text-xs font-black text-slate-700">تعديل سريع</summary>
              <AdminActionForm action={updateBusinessAction} className="mt-2 grid gap-2">
                <input name="businessId" type="hidden" value={business.id} />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="name" defaultValue={business.name} />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="phone" defaultValue={business.phone} />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="area" defaultValue={business.area} />
                <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="status" defaultValue={business.status}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
                <AdminSubmitButton className="h-9 rounded-md bg-orange-500 text-xs font-black text-white disabled:opacity-70">حفظ</AdminSubmitButton>
              </AdminActionForm>
            </details>
          </div>,
        ])}
      />

      <Pagination basePath="/admin/businesses" page={page} searchParams={params} totalPages={getTotalPages(count, adminPageSize)} />
    </>
  );
}
