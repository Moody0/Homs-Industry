import { AuthField } from "@/components/auth/auth-field";
import { UploadImageField } from "@/components/forms/upload-image-field";

export function AdminCategoryForm() {
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <AuthField id="admin-category-name" label="اسم الفئة" name="name" placeholder="سيارات" />
      <AuthField id="admin-category-slug" label="الرابط المختصر" name="slug" placeholder="cars" />
      <UploadImageField id="admin-category-image" label="صورة أو أيقونة الفئة" name="image" />
    </div>
  );
}
