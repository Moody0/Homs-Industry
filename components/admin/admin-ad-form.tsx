import { AuthField } from "@/components/auth/auth-field";
import { UploadImageField } from "@/components/forms/upload-image-field";

export function AdminAdForm() {
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <AuthField id="admin-ad-title" label="عنوان الإعلان" name="title" placeholder="عنوان الإعلان" />
      <AuthField id="admin-ad-link" label="الرابط" name="link_url" placeholder="/categories/cars" />
      <UploadImageField id="admin-ad-image" label="صورة الإعلان" name="image" />
    </div>
  );
}
