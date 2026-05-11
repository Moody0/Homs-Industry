import "server-only";

import { revalidatePath } from "next/cache";
import type { ZodError, ZodType } from "zod";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildStoragePath, uploadLimits, validateImageFile } from "@/lib/uploads";

export function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value.length > 0 ? value : null;
}

export function numberText(formData: FormData, name: string, fallback = "0") {
  const value = text(formData, name);
  return value.length > 0 ? value : fallback;
}

export function success(message: string): AdminActionResult {
  return { success: true, message };
}

export function failure(message: string, errors?: Record<string, string[]>): AdminActionResult {
  return { success: false, message, errors };
}

export function validationFailure(error: ZodError): AdminActionResult {
  return failure("تأكد من الحقول وحاول مرة أخرى.", error.flatten().fieldErrors);
}

export function supabaseFailure(error: { message?: string } | null | undefined, fallbackMessage: string): AdminActionResult {
  return failure(error?.message ? `${fallbackMessage}: ${error.message}` : fallbackMessage);
}

export function parseAdminForm<T>(schema: ZodType<T>, values: unknown) {
  const parsed = schema.safeParse(values);
  return parsed.success ? { data: parsed.data, error: null } : { data: null, error: parsed.error };
}

export async function uploadAdminImage(bucket: "category-images" | "ad-images", formData: FormData, fieldName: string) {
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size === 0) {
    return { error: null, url: null };
  }

  const limit = bucket === "category-images" ? uploadLimits.categoryImage : uploadLimits.adImage;
  const validation = validateImageFile(file, limit);

  if (!validation.ok) {
    return { error: validation.message, url: null };
  }

  const supabase = await createAdminClient();
  const path = buildStoragePath(["admin", bucket], validation.extension);
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });

  if (error) {
    return { error: `تعذر رفع الصورة: ${error.message}`, url: null };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { error: null, url: data.publicUrl };
}

export async function revalidateBusinessById(businessId: string) {
  if (!businessId) return;

  const supabase = await createAdminClient();
  const { data } = await supabase.from("businesses").select("slug").eq("id", businessId).single();

  if (data?.slug) {
    revalidatePath(`/businesses/${data.slug}`);
  }
}

export async function ensureRecordExists(table: "businesses" | "categories", id: string, message: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from(table).select("id").eq("id", id).maybeSingle();

  if (error) return failure(`تعذر التحقق من البيانات: ${error.message}`);
  if (!data) return failure(message);

  return null;
}
