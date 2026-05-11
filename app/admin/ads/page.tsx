import { deleteAdAction, upsertAdAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { adminPageSize, getAdminRange, getTotalPages, parseAdminPage } from "@/lib/admin/pagination";
import { createAdminClient } from "@/lib/supabase/admin";

const adTypes = ["home_slider", "featured_business", "category_ad"] as const;

type AdminAdsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type AdRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  type: string;
  priority: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  link_url: string | null;
  business_id: string | null;
  category_id: string | null;
};

function adStatus(ad: AdRow, today: string) {
  if (!ad.is_active) return { label: "معطل", status: "inactive" };
  if (ad.start_date > today) return { label: "مجدول", status: "pending" };
  if (ad.end_date < today) return { label: "منتهي", status: "rejected" };
  return { label: "فعال الآن", status: "active" };
}

export default async function AdminAdsPage({ searchParams }: AdminAdsPageProps) {
  const params = await searchParams;
  const page = parseAdminPage(params.page);
  const range = getAdminRange(page);
  const today = new Date().toISOString().slice(0, 10);
  const supabase = await createAdminClient();
  const [{ data: categories }, { data: businesses }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("businesses").select("id, name").order("created_at", { ascending: false }).limit(100),
  ]);

  let adsQuery = supabase
    .from("ads")
    .select("id, title, description, image_url, alt_text, type, priority, is_active, start_date, end_date, link_url, business_id, category_id", { count: "exact" })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.type) adsQuery = adsQuery.eq("type", params.type);
  if (params.active === "true") adsQuery = adsQuery.eq("is_active", true);
  if (params.active === "false") adsQuery = adsQuery.eq("is_active", false);

  const { count, data: ads } = await adsQuery.range(range.from, range.to);
  const rows = (ads ?? []) as AdRow[];

  return (
    <>
      <AdminHeader description="تحكم بإعلانات الصفحة الرئيسية والفئات والمحلات المميزة." title="إدارة الإعلانات" />
      <AdminActionForm action={upsertAdAction} className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4" encType="multipart/form-data">
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="title" placeholder="عنوان الإعلان" required />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="type" required>{adTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="priority" placeholder="الأولوية" type="number" />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="isActive" defaultValue="true"><option value="true">فعال</option><option value="false">معطل</option></select>
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="startDate" type="date" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="endDate" type="date" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="linkUrl" placeholder="رابط الإعلان" />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="altText" placeholder="وصف الصورة" />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="categoryId"><option value="">بدون فئة</option>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="businessId"><option value="">بدون محل</option>{(businesses ?? []).map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select>
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm md:col-span-2" name="description" placeholder="الوصف" />
        <input accept="image/*" className="h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-4" name="image" required type="file" />
        <AdminSubmitButton className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white disabled:opacity-70 md:col-span-4">إنشاء إعلان</AdminSubmitButton>
      </AdminActionForm>

      <form className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="type" defaultValue={params.type ?? ""}>
          <option value="">كل الأنواع</option>
          {adTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="active" defaultValue={params.active ?? ""}>
          <option value="">كل حالات التفعيل</option>
          <option value="true">مفعلة</option>
          <option value="false">معطلة</option>
        </select>
        <button className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
      </form>

      <AdminTable
        headers={["الإعلان", "النوع", "الأولوية", "الفترة", "الحالة", "الإجراءات"]}
        rows={rows.map((ad) => {
          const status = adStatus(ad, today);
          return [
            <div key="title" className="min-w-48"><p className="font-black text-slate-950">{ad.title}</p><p className="text-xs text-slate-500">{ad.description}</p></div>,
            ad.type,
            ad.priority,
            `${ad.start_date} - ${ad.end_date}`,
            <StatusBadge key="status" status={status.status}>{status.label}</StatusBadge>,
            <div className="min-w-96 space-y-2" key="actions">
              <details className="rounded-md border border-slate-200 p-2">
                <summary className="cursor-pointer text-xs font-black">تعديل</summary>
                <AdminActionForm action={upsertAdAction} className="mt-2 grid gap-2" encType="multipart/form-data">
                  <input name="adId" type="hidden" value={ad.id} />
                  <input name="existingImageUrl" type="hidden" value={ad.image_url} />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="title" defaultValue={ad.title} />
                  <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="type" defaultValue={ad.type}>{adTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="priority" defaultValue={ad.priority} type="number" />
                  <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="isActive" defaultValue={String(ad.is_active)}><option value="true">فعال</option><option value="false">معطل</option></select>
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="startDate" defaultValue={ad.start_date} type="date" />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="endDate" defaultValue={ad.end_date} type="date" />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="linkUrl" defaultValue={ad.link_url ?? ""} />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="altText" defaultValue={ad.alt_text ?? ""} />
                  <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="description" defaultValue={ad.description ?? ""} />
                  <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="categoryId" defaultValue={ad.category_id ?? ""}><option value="">بدون فئة</option>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                  <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="businessId" defaultValue={ad.business_id ?? ""}><option value="">بدون محل</option>{(businesses ?? []).map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select>
                  <input accept="image/*" className="text-xs" name="image" type="file" />
                  <AdminSubmitButton className="h-9 rounded-md bg-orange-500 text-xs font-black text-white disabled:opacity-70">حفظ</AdminSubmitButton>
                </AdminActionForm>
              </details>
              <AdminActionForm action={deleteAdAction} confirmMessage={`هل تريد حذف الإعلان "${ad.title}"؟`}>
                <input name="adId" type="hidden" value={ad.id} />
                <AdminSubmitButton className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">حذف</AdminSubmitButton>
              </AdminActionForm>
            </div>,
          ];
        })}
      />

      <Pagination basePath="/admin/ads" page={page} searchParams={params} totalPages={getTotalPages(count, adminPageSize)} />
    </>
  );
}
