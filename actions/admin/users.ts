"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { updateUserRoleSchema } from "@/lib/validation/admin";
import { failure, parseAdminForm, success, supabaseFailure, text, validationFailure } from "./_helpers";

export async function changeUserRoleAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = parseAdminForm(updateUserRoleSchema, {
    role: text(formData, "role"),
    userId: text(formData, "userId"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (targetError) return supabaseFailure(targetError, "تعذر التحقق من المستخدم");
  if (!targetUser) return failure("المستخدم غير موجود.");

  if (targetUser.role === "admin" && parsed.data.role !== "admin") {
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) return supabaseFailure(countError, "تعذر التحقق من عدد المديرين");
    if ((count ?? 0) <= 1) {
      return failure("لا يمكن إزالة صلاحية آخر مدير في النظام.");
    }

    if (targetUser.id === admin.id && (count ?? 0) <= 1) {
      return failure("لا يمكنك إزالة صلاحيتك وأنت المدير الوحيد.");
    }
  }

  const { error } = await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
  if (error) return supabaseFailure(error, "تعذر تغيير دور المستخدم");

  revalidatePath("/admin/users");
  return success("تم تحديث دور المستخدم.");
}
