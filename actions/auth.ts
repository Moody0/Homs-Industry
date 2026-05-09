"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/security/rate-limit";
import {
  genericAuthError,
  loginSchema,
  normalizeSyrianPhone,
  registerSchema,
} from "@/lib/validation/auth";

export type AuthActionState = {
  message: string;
  success?: boolean;
};

const initialErrorState: AuthActionState = { message: "" };

function registerErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === "user_already_exists" || error.message?.toLowerCase().includes("already registered")) {
    return "يوجد حساب مسجل بهذا البريد الإلكتروني مسبقاً.";
  }

  if (error.message?.toLowerCase().includes("database")) {
    return "تعذر إنشاء الملف الشخصي. تأكد أن اسم المستخدم أو رقم الهاتف غير مستخدمين مسبقاً.";
  }

  return "تعذر إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى.";
}

function loginErrorMessage(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  if (error.code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "لم يتم تأكيد البريد الإلكتروني بعد. افتح بريدك واضغط رابط التأكيد ثم حاول مرة أخرى.";
  }

  if (error.code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return genericAuthError;
  }

  return genericAuthError;
}

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _previousState: AuthActionState = initialErrorState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const parsed = loginSchema.safeParse({
    identifier: getFormString(formData, "identifier"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? genericAuthError };
  }

  const supabase = await createClient();
  const identifier = parsed.data.identifier;

  if (isRateLimited(`login:${identifier}`)) {
    return { message: genericAuthError };
  }

  let email = identifier.includes("@") ? identifier.toLowerCase() : null;

  if (!email) {
    const { data, error } = await supabase.rpc("resolve_login_email", {
      login_identifier: identifier,
    });

    if (error?.code === "PGRST202") {
      return { message: "تسجيل الدخول باسم المستخدم غير متاح حالياً. طبّق ترحيلات Supabase أو استخدم البريد الإلكتروني." };
    }

    if (error || !data) {
      return { message: genericAuthError };
    }

    email = data as string;
  }

  if (!email) {
    return { message: genericAuthError };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { message: loginErrorMessage(error) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerAction(
  _previousState: AuthActionState = initialErrorState,
  formData: FormData,
): Promise<AuthActionState> {
  void _previousState;

  const parsed = registerSchema.safeParse({
    email: getFormString(formData, "email"),
    fullName: getFormString(formData, "fullName"),
    username: getFormString(formData, "username"),
    phone: getFormString(formData, "phone"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر إنشاء الحساب" };
  }

  const phone = normalizeSyrianPhone(parsed.data.phone);

  if (!phone) {
    return { message: "أدخل رقم سوري صحيح مثل 09XXXXXXXX" };
  }

  const supabase = await createClient();
  const { data: usernameAvailable, error: usernameError } = await supabase.rpc("is_username_available", {
    candidate_username: parsed.data.username,
  });

  if (!usernameError && usernameAvailable === false) {
    return { message: "اسم المستخدم مستخدم مسبقاً." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        phone,
        username: parsed.data.username,
      },
    },
  });

  if (error) {
    return { message: registerErrorMessage(error) };
  }

  if (!data.session) {
    return {
      message: "تم إنشاء الحساب. إذا كان تأكيد البريد مفعلاً في Supabase، افتح بريدك واضغط رابط التأكيد قبل تسجيل الدخول.",
      success: true,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
