"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { categoryIdSchema, categoryUpsertSchema } from "@/lib/validation/admin";
import {
  failure,
  nullableText,
  numberText,
  parseAdminForm,
  success,
  supabaseFailure,
  text,
  uploadAdminImage,
  validationFailure,
} from "./_helpers";

export async function upsertCategoryAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(categoryUpsertSchema, {
    categoryId: nullableText(formData, "categoryId"),
    description: nullableText(formData, "description"),
    existingImageUrl: nullableText(formData, "existingImageUrl"),
    iconName: nullableText(formData, "iconName"),
    isActive: text(formData, "isActive"),
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    sortOrder: numberText(formData, "sortOrder"),
  });
  if (parsed.error) return validationFailure(parsed.error);

  const imageUpload = await uploadAdminImage("category-images", formData, "image");
  if (imageUpload.error) return failure(imageUpload.error);

  const supabase = await createClient();
  const payload = {
    description: parsed.data.description,
    icon_name: parsed.data.iconName,
    image_url: imageUpload.url ?? parsed.data.existingImageUrl,
    is_active: parsed.data.isActive,
    name: parsed.data.name,
    slug: parsed.data.slug,
    sort_order: parsed.data.sortOrder,
  };

  const result = parsed.data.categoryId
    ? await supabase.from("categories").update(payload).eq("id", parsed.data.categoryId)
    : await supabase.from("categories").insert(payload);

  if (result.error) return supabaseFailure(result.error, "تعذر حفظ الفئة");

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  return success(parsed.data.categoryId ? "تم تحديث الفئة." : "تم إنشاء الفئة.");
}

export async function deleteCategoryAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = parseAdminForm(categoryIdSchema, { categoryId: text(formData, "categoryId") });
  if (parsed.error) return validationFailure(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", parsed.data.categoryId);
  if (error) return supabaseFailure(error, "تعذر حذف الفئة. تأكد من عدم ارتباطها بمحلات أو فئات فرعية");

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  return success("تم حذف الفئة.");
}
