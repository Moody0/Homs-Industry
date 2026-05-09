import { changeUserRoleAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { adminPageSize, getAdminRange, getTotalPages, parseAdminPage } from "@/lib/admin/pagination";
import { createClient } from "@/lib/supabase/server";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function safeSearch(value: string) {
  return value.replace(/[%_,]/g, "").trim();
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const page = parseAdminPage(params.page);
  const range = getAdminRange(page);
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, username, phone, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.role) query = query.eq("role", params.role);
  if (params.q) {
    const q = safeSearch(params.q);
    if (q) query = query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { count, data: users } = await query.range(range.from, range.to);

  return (
    <>
      <AdminHeader description="عرض المستخدمين وتغيير الأدوار دون كشف بيانات Supabase Auth الحساسة." title="إدارة المستخدمين" />

      <form className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue={params.q ?? ""} name="q" placeholder="بحث بالاسم أو المستخدم أو الهاتف" />
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" name="role" defaultValue={params.role ?? ""}>
          <option value="">كل الأدوار</option>
          <option value="admin">مدير</option>
          <option value="user">مستخدم</option>
        </select>
        <button className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
      </form>

      <AdminTable
        headers={["المستخدم", "الهاتف", "الدور", "تاريخ الإنشاء", "الإجراءات"]}
        rows={(users ?? []).map((user) => [
          <div key="user"><p className="font-black text-slate-950">{user.full_name}</p><p className="text-xs text-slate-500">@{user.username}</p></div>,
          <span key="phone" dir="ltr">{user.phone}</span>,
          <StatusBadge key="role" status={user.role === "admin" ? "approved" : "inactive"}>{user.role === "admin" ? "مدير" : "مستخدم"}</StatusBadge>,
          new Date(user.created_at).toLocaleDateString("ar-SY"),
          <div className="min-w-72 space-y-2" key="actions">
            <AdminActionForm
              action={changeUserRoleAction}
              className="flex flex-wrap gap-2"
              confirmMessage={user.role === "admin" ? "تغيير دور هذا المدير قد يزيل صلاحياته. هل تريد المتابعة؟" : "هل تريد تغيير دور هذا المستخدم؟"}
            >
              <input name="userId" type="hidden" value={user.id} />
              <select className="h-9 rounded-md border border-slate-200 px-2 text-xs" name="role" defaultValue={user.role}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <AdminSubmitButton className="rounded-md bg-orange-500 px-3 py-1 text-xs font-black text-white disabled:opacity-70">تغيير الدور</AdminSubmitButton>
            </AdminActionForm>
          </div>,
        ])}
      />

      <Pagination basePath="/admin/users" page={page} searchParams={params} totalPages={getTotalPages(count, adminPageSize)} />
    </>
  );
}
