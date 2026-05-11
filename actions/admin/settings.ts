"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { failure, nullableText, success, supabaseFailure, uploadAdminImage } from "./_helpers";

export async function updateHomeHeroAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();
  const imageUpload = await uploadAdminImage("ad-images", formData, "image");
  if (imageUpload.error) return failure(imageUpload.error);

  const existingImageUrl = nullableText(formData, "existingImageUrl");
  const finalImageUrl = imageUpload.url ?? existingImageUrl ?? "/images/hero-image.png";
  const supabase = await createAdminClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "home_hero",
    value: {
      alt_text: nullableText(formData, "altText") ?? "خدمات صناعية في حمص",
      image_url: finalImageUrl,
    },
  });

  if (error) return supabaseFailure(error, "تعذر حفظ إعدادات الهيرو");

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return success("تم حفظ إعدادات الهيرو.");
}
