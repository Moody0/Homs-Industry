"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";
import bcrypt from "bcryptjs";
import { getPostgresPool } from "@/lib/db/postgres";
import { isRateLimited } from "@/lib/security/rate-limit";
import { normalizeSyrianPhone, registerSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  message: string;
  success?: boolean;
};

const initialErrorState: AuthActionState = { message: "" };

function registerDatabaseError(error: unknown) {
  const dbError = error as { code?: string; constraint?: string };

  if (dbError.code === "23505") {
    if (dbError.constraint?.includes("email")) return "يوجد حساب مسجل بهذا البريد الإلكتروني مسبقاً.";
    if (dbError.constraint?.includes("username")) return "اسم المستخدم مستخدم مسبقاً.";
    if (dbError.constraint?.includes("phone")) return "رقم الهاتف مستخدم مسبقاً.";
    return "يوجد حساب بنفس البريد أو اسم المستخدم أو رقم الهاتف.";
  }

  return "خطأ في إنشاء الحساب. حاول مرة أخرى.";
}

async function createAccount(
  client: PoolClient,
  data: {
    email: string;
    fullName: string;
    passwordHash: string;
    phone: string;
    username: string;
  },
) {
  const existing = await client.query<{ field: "email" | "username" | "phone" }>(
    `
      select 'email' as field
      from public.auth_users
      where lower(email) = lower($1)
      union all
      select 'username' as field
      from public.profiles
      where username = $2::citext
      union all
      select 'phone' as field
      from public.profiles
      where phone = $3
      limit 1
    `,
    [data.email, data.username, data.phone],
  );

  const conflict = existing.rows[0]?.field;
  if (conflict === "email") return "يوجد حساب مسجل بهذا البريد الإلكتروني مسبقاً.";
  if (conflict === "username") return "اسم المستخدم مستخدم مسبقاً.";
  if (conflict === "phone") return "رقم الهاتف مستخدم مسبقاً.";

  const user = await client.query<{ id: string }>(
    `
      insert into public.auth_users (email, password_hash)
      values (lower($1), $2)
      returning id
    `,
    [data.email, data.passwordHash],
  );

  await client.query(
    `
      insert into public.profiles (id, full_name, username, email, phone, role)
      values ($1, $2, $3::citext, lower($4)::citext, $5, 'user')
    `,
    [user.rows[0].id, data.fullName, data.username, data.email, data.phone],
  );

  return null;
}

export async function registerAction(
  _previousState: AuthActionState = initialErrorState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر إنشاء الحساب" };
  }

  if (isRateLimited(`register:${parsed.data.email}`, 20, 300_000)) {
    return { message: "تمت محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مرة أخرى." };
  }

  const phone = normalizeSyrianPhone(parsed.data.phone);

  if (!phone) {
    return { message: "أدخل رقم سوري صحيح مثل 09XXXXXXXX" };
  }

  const client = await getPostgresPool().connect();

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await client.query("begin");
    const conflictMessage = await createAccount(client, {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      passwordHash,
      phone,
      username: parsed.data.username.toLowerCase(),
    });

    if (conflictMessage) {
      await client.query("rollback");
      return { message: conflictMessage };
    }

    await client.query("commit");
    revalidatePath("/", "layout");

    return {
      message: "تم إنشاء حسابك بنجاح.",
      success: true,
    };
  } catch (error) {
    console.error("Registration error:", error);
    await client.query("rollback").catch(() => undefined);
    return { message: registerDatabaseError(error) };
  } finally {
    client.release();
  }
}

export async function loginAction(
  _previousState: AuthActionState = initialErrorState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;
  void formData;

  return { message: "استخدم نموذج تسجيل الدخول في الصفحة." };
}

export async function logoutAction() {
  redirect("/api/auth/signout?callbackUrl=/");
}
