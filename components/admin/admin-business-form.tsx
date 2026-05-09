import { AuthField } from "@/components/auth/auth-field";

export function AdminBusinessForm() {
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <AuthField id="admin-business-name" label="اسم المحل" name="name" placeholder="اسم المحل" />
      <AuthField id="admin-business-status" label="الحالة" name="status" placeholder="approved / pending / rejected" />
    </div>
  );
}
