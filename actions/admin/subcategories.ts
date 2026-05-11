"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { subcategoryIdSchema, subcategoryUpsertSchema } from "@/lib/validation/admin";
import {
  ensureRecordExists,
  nullableText,
  numberText,
  parseAdminForm,
  success,
  supabaseFailure,
  text,
  validationFailure,
} from "./_helpers";

export async function upsertSubcategoryAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(subcategoryUpsertSchema, {
    categoryId: text(formData, "categoryId"),
    description: nullableText(formData, "description"),
    isActive: text(formData, "isActive"),
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    sortOrder: numberText(formData, "sortOrder"),
    subcategoryId: nullableText(formData, "subcategoryId"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const categoryMissing = await ensureRecordExists("categories", parsed.data.categoryId, "الفئة الرئيسية المحددة غير موجودة.");
  if (categoryMissing) return categoryMissing;

  const supabase = await createAdminClient();
  const payload = {
    category_id: parsed.data.categoryId,
    description: parsed.data.description,
    is_active: parsed.data.isActive,
    name: parsed.data.name,
    slug: parsed.data.slug,
    sort_order: parsed.data.sortOrder,
  };

  const result = parsed.data.subcategoryId
    ? await supabase.from("subcategories").update(payload).eq("id", parsed.data.subcategoryId)
    : await supabase.from("subcategories").insert(payload);

  if (result.error) return supabaseFailure(result.error, "تعذر حفظ الفئة الفرعية");

  revalidatePath("/admin/subcategories");
  revalidatePath("/categories");
  return success(parsed.data.subcategoryId ? "تم تحديث الفئة الفرعية." : "تم إنشاء الفئة الفرعية.");
}

export async function deleteSubcategoryAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(subcategoryIdSchema, { subcategoryId: text(formData, "subcategoryId") });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subcategories").delete().eq("id", parsed.data.subcategoryId);
  if (error) return supabaseFailure(error, "تعذر حذف الفئة الفرعية. تأكد من عدم ارتباطها بمحلات");

  revalidatePath("/admin/subcategories");
  revalidatePath("/categories");
  return success("تم حذف الفئة الفرعية.");
}
