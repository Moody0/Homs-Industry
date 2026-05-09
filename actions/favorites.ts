"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function addFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const businessId = String(formData.get("businessId") ?? "");
  const supabase = await createClient();

  if (businessId) {
    await supabase.from("favorites").upsert({ user_id: user.id, business_id: businessId });
    const { data: business } = await supabase.from("businesses").select("slug").eq("id", businessId).single();
    revalidatePath("/favorites");
    if (business?.slug) revalidatePath(`/businesses/${business.slug}`);
  }
}

export async function removeFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const businessId = String(formData.get("businessId") ?? "");
  const supabase = await createClient();

  if (businessId) {
    const { data: business } = await supabase.from("businesses").select("slug").eq("id", businessId).single();
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("business_id", businessId);
    revalidatePath("/favorites");
    if (business?.slug) revalidatePath(`/businesses/${business.slug}`);
  }
}
