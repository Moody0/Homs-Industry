import { deleteCategoryAction, upsertCategoryAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon_name, image_url, sort_order, is_active")
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminHeader description="أنشئ وعدّل فئات الصفحة الرئيسية وبطاقات التصنيف." title="إدارة الفئات" />

      <AdminActionForm action={upsertCategoryAction} className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4" encType="multipart/form-data">
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="name" placeholder="اسم الفئة" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="slug" placeholder="slug" required />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="iconName" placeholder="car / truck / house" />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="sortOrder" placeholder="الترتيب" type="number" />
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm md:col-span-2" name="description" placeholder="الوصف" />
        <input accept="image/*" className="h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2" name="image" type="file" />
        <AdminSubmitButton className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white disabled:opacity-70 md:col-span-4">إنشاء فئة</AdminSubmitButton>
      </AdminActionForm>

      <AdminTable
        headers={["الفئة", "الرابط", "الترتيب", "الحالة", "الإجراءات"]}
        rows={(categories ?? []).map((category) => [
          <div key="name" className="min-w-48"><p className="font-black text-slate-950">{category.name}</p><p className="text-xs text-slate-500">{category.description}</p></div>,
          category.slug,
          category.sort_order,
          <StatusBadge key="status" status={category.is_active ? "active" : "inactive"}>{category.is_active ? "فعالة" : "معطلة"}</StatusBadge>,
          <div className="min-w-80 space-y-2" key="actions">
            <details className="rounded-md border border-slate-200 p-2">
              <summary className="cursor-pointer text-xs font-black">تعديل</summary>
              <AdminActionForm action={upsertCategoryAction} className="mt-2 grid gap-2" encType="multipart/form-data">
                <input name="categoryId" type="hidden" value={category.id} />
                <input name="existingImageUrl" type="hidden" value={category.image_url ?? ""} />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="name" defaultValue={category.name} required />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="slug" defaultValue={category.slug} required />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="iconName" defaultValue={category.icon_name ?? ""} />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="sortOrder" defaultValue={category.sort_order} type="number" />
                <input className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="description" defaultValue={category.description ?? ""} />
                <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="isActive" defaultValue={String(category.is_active)}><option value="true">فعالة</option><option value="false">معطلة</option></select>
                <input accept="image/*" className="text-xs" name="image" type="file" />
                <AdminSubmitButton className="h-9 rounded-md bg-orange-500 text-xs font-black text-white disabled:opacity-70">حفظ</AdminSubmitButton>
              </AdminActionForm>
            </details>
            <AdminActionForm action={deleteCategoryAction} confirmMessage={`هل تريد حذف الفئة "${category.name}"؟`}><input name="categoryId" type="hidden" value={category.id} /><AdminSubmitButton className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-70">حذف</AdminSubmitButton></AdminActionForm>
          </div>,
        ])}
      />
    </>
  );
}
