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

// Retry signup with exponential backoff to handle Supabase rate limiting
async function signUpWithRetry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  password: string,
  metadata: Record<string, unknown>,
  maxRetries = 3,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (!error) {
      return { data, error: null };
    }

    const message = error.message?.toLowerCase() ?? "";
    const isRateLimitError = message.includes("rate limit") || message.includes("too many");

    // If it's not a rate limit error, return immediately
    if (!isRateLimitError) {
      return { data: null, error };
    }

    // Last attempt failed with rate limit, return error
    if (attempt === maxRetries - 1) {
      return { data: null, error };
    }

    // Exponential backoff: 500ms, 1000ms, 2000ms
    const delay = Math.pow(2, attempt) * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return { data: null, error: { message: "Failed after retries" } };
}

export type AuthActionState = {
  message: string;
  success?: boolean;
};

const initialErrorState: AuthActionState = { message: "" };

function registerErrorMessage(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  if (error.code === "user_already_exists" || message.includes("already registered")) {
    return "يوجد حساب مسجل بهذا البريد الإلكتروني مسبقاً.";
  }

  if (message.includes("username") || message.includes("يستخدم مسبقاً")) {
    return "اسم المستخدم مستخدم مسبقاً.";
  }

  if (message.includes("phone") || message.includes("رقم الهاتف")) {
    return "رقم الهاتف مستخدم مسبقاً.";
  }

  if (error.code === "email_address_invalid" || message.includes("invalid email")) {
    return "أدخل بريداً إلكترونياً صحيحاً.";
  }

  if (error.code === "weak_password" || message.includes("weak password")) {
    return "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل مع حروف وأرقام.";
  }

  if (error.code === "signup_disabled" || message.includes("signup is disabled")) {
    return "إنشاء الحسابات غير متاح حالياً. حاول مرة أخرى لاحقاً.";
  }

  if (message.includes("rate limit") || message.includes("too many")) {
    return "خادم التسجيل مشغول حالياً. الرجاء الانتظار دقيقة واحدة ثم المحاولة مجدداً.";
  }

  if (message.includes("duplicate") || message.includes("database")) {
    return "يوجد حساب بنفس البريد أو اسم المستخدم أو رقم الهاتف.";
  }

  return "تعذر إنشاء الحساب الآن. جرّب بريداً أو اسم مستخدم أو رقم هاتف آخر، أو حاول بعد قليل.";
}

function loginErrorMessage(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  if (error.code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "حسابك يحتاج تفعيل البريد الإلكتروني أولاً. افتح رسالة التفعيل في بريدك ثم حاول تسجيل الدخول مرة أخرى.";
  }

  if (error.code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "بيانات الدخول غير صحيحة. إذا أنشأت الحساب للتو، تأكد من تفعيل البريد الإلكتروني أولاً.";
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

  // Rate limit: max 10 registration attempts per email in 5 minutes
  if (isRateLimited(`register:${parsed.data.email}`, 10, 300_000)) {
    return { message: "حاولت إنشاء حساب عدة مرات. الرجاء الانتظار 5 دقائق قبل المحاولة مجدداً." };
  }

  const phone = normalizeSyrianPhone(parsed.data.phone);

  if (!phone) {
    return { message: "أدخل رقم سوري صحيح مثل 09XXXXXXXX" };
  }

  const supabase = await createClient();

  const { data, error } = await signUpWithRetry(supabase, parsed.data.email, parsed.data.password, {
    email: parsed.data.email,
    full_name: parsed.data.fullName,
    phone,
    username: parsed.data.username,
  });

  if (error) {
    return { message: registerErrorMessage(error) };
  }

  if (!data?.session) {
    return {
      message: "تم إنشاء الحساب بنجاح. أرسلنا لك رسالة تفعيل على بريدك الإلكتروني، افتحها واضغط رابط التفعيل قبل تسجيل الدخول.",
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
