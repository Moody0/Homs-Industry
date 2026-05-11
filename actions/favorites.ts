"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/supabase/auth";
import { dbQuery } from "@/lib/db/postgres";
import { z } from "zod";

export type FavoriteActionState = {
  favorite?: boolean;
  message: string;
  success?: boolean;
};

const guidSchema = z.guid();

async function setFavorite(userId: string, businessId: string, shouldAdd: boolean) {
  const parsedBusinessId = guidSchema.safeParse(businessId);
  if (!parsedBusinessId.success) {
    return { ok: false, message: "تعذر تحديث المفضلة. حدّث الصفحة وحاول مرة أخرى." };
  }

  const businessResult = await dbQuery<{ slug: string }>(
    "select slug from public.businesses where id = $1::uuid and status = 'approved' limit 1",
    [parsedBusinessId.data],
  );
  const business = businessResult.rows[0];

  if (!business) {
    return { ok: false, message: "تعذر العثور على المحل المطلوب." };
  }

  if (shouldAdd) {
    await dbQuery(
      `
        insert into public.favorites (user_id, business_id)
        values ($1::uuid, $2::uuid)
        on conflict (user_id, business_id) do nothing
      `,
      [userId, parsedBusinessId.data],
    );
  } else {
    await dbQuery(
      "delete from public.favorites where user_id = $1::uuid and business_id = $2::uuid",
      [userId, parsedBusinessId.data],
    );
  }

  revalidatePath("/favorites");
  revalidatePath(`/businesses/${business.slug}`);

  return { ok: true };
}

export async function addFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const businessId = String(formData.get("businessId") ?? "");

  if (businessId) {
    await setFavorite(user.id, businessId, true);
  }
}

export async function removeFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const businessId = String(formData.get("businessId") ?? "");

  if (businessId) {
    await setFavorite(user.id, businessId, false);
  }
}

export async function toggleFavoriteAction(
  _previousState: FavoriteActionState,
  formData: FormData,
): Promise<FavoriteActionState> {
  void _previousState;

  const user = await getCurrentUser();
  if (!user) {
    return { message: "سجّل الدخول أولاً لإضافة المحل إلى المفضلة" };
  }

  const businessId = String(formData.get("businessId") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const shouldAdd = intent === "add";

  if (!businessId || !["add", "remove"].includes(intent)) {
    return { message: "تعذر تحديث المفضلة. حاول مرة أخرى." };
  }

  const result = await setFavorite(user.id, businessId, shouldAdd);

  if (!result.ok) {
    return { message: result.message ?? "تعذر تحديث المفضلة. حاول مرة أخرى." };
  }

  return {
    favorite: shouldAdd,
    message: shouldAdd ? "تمت إضافة المحل إلى المفضلة" : "تمت إزالة المحل من المفضلة",
    success: true,
  };
}
