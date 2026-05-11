import { deleteSubcategoryAction, upsertSubcategoryAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminSubcategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  category_id: string;
  category: { name: string }[] | { name: string } | null;
};

function categoryName(relation: AdminSubcategoryRow["category"]) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name;
}

export default async function AdminSubcategoriesPage() {
  const supabase = await createAdminClient();
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("subcategories").select("id, name, slug, description, sort_order, is_active, category_id, category:categories(name)").order("sort_order"),
  ]);
  const rows = (subcategories ?? []) as AdminSubcategoryRow[];

  return (
    <>
      <AdminHeader description="نظّم الفئات الفرعية داخل كل فئة رئيسية." title="إدارة الفئات الفرعية" />
      <AdminActionForm action={upsertSubcategoryAction} className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="categoryId" required><option value="">الفئة الرئيسية</option>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="name" placeholder="اسم الفئة الفرعية" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="slug" placeholder="slug" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="sortOrder" placeholder="الترتيب" type="number" />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm md:col-span-4" name="description" placeholder="الوصف" />
        <AdminSubmitButton className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white disabled:opacity-70 md:col-span-4">إنشاء فئة فرعية</AdminSubmitButton>
      </AdminActionForm>
      <AdminTable
        headers={["الفئة الفرعية", "الفئة", "الرابط", "الترتيب", "الحالة", "الإجراءات"]}
        rows={rows.map((subcategory) => [
          subcategory.name,
          categoryName(subcategory.category),
          subcategory.slug,
          subcategory.sort_order,
          <StatusBadge key="status" status={subcategory.is_active ? "active" : "inactive"}>{subcategory.is_active ? "فعالة" : "معطلة"}</StatusBadge>,
          <div className="min-w-80 space-y-2" key="actions">
            <details className="rounded-md border border-slate-200 p-2"><summary className="cursor-pointer text-xs font-black">تعديل</summary><AdminActionForm action={upsertSubcategoryAction} className="mt-2 grid gap-2"><input name="subcategoryId" type="hidden" value={subcategory.id} /><select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="categoryId" defaultValue={subcategory.category_id}>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="name" defaultValue={subcategory.name} /><input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="slug" defaultValue={subcategory.slug} /><input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="sortOrder" defaultValue={subcategory.sort_order} type="number" /><input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="description" defaultValue={subcategory.description ?? ""} /><select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="isActive" defaultValue={String(subcategory.is_active)}><option value="true">فعالة</option><option value="false">معطلة</option></select><AdminSubmitButton className="h-9 rounded-md bg-orange-500 text-xs font-black text-white disabled:opacity-70">حفظ</AdminSubmitButton></AdminActionForm></details>
            <AdminActionForm action={deleteSubcategoryAction} confirmMessage={`هل تريد حذف الفئة الفرعية "${subcategory.name}"؟`}><input name="subcategoryId" type="hidden" value={subcategory.id} /><AdminSubmitButton className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">حذف</AdminSubmitButton></AdminActionForm>
          </div>,
        ])}
      />
    </>
  );
}
