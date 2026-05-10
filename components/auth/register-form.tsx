"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { AlertCircle, CheckCircle2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { registerAction, type AuthActionState } from "@/actions/nextauth";
import { AuthField } from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "" };

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (!state.success) return;

    const timer = window.setTimeout(() => {
      router.push("/login?created=1");
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [router, state.success]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <AuthField
        autoComplete="name"
        id="fullName"
        icon={<UserRound aria-hidden className="size-4" />}
        label="الاسم الكامل"
        name="fullName"
        placeholder="مثال: أحمد الخطيب"
        required
        wrapperClassName="sm:col-span-2"
      />
      <AuthField
        autoComplete="email"
        dir="ltr"
        id="email"
        icon={<Mail aria-hidden className="size-4" />}
        label="البريد الإلكتروني"
        name="email"
        placeholder="name@email.com"
        required
        type="email"
      />
      <AuthField
        autoComplete="username"
        dir="ltr"
        id="username"
        icon={<UserRound aria-hidden className="size-4" />}
        label="اسم المستخدم"
        name="username"
        placeholder="ahmad_123"
        required
      />
      <AuthField
        autoComplete="tel"
        dir="ltr"
        id="phone"
        icon={<Phone aria-hidden className="size-4" />}
        label="رقم الهاتف"
        name="phone"
        placeholder="09xxxxxxxx"
        required
        type="tel"
      />
      <AuthField
        autoComplete="new-password"
        id="password"
        hint="8 أحرف أو أكثر"
        icon={<LockKeyhole aria-hidden className="size-4" />}
        label="كلمة المرور"
        name="password"
        placeholder="8 أحرف على الأقل"
        required
        type="password"
      />
      <AuthField
        autoComplete="new-password"
        id="confirmPassword"
        icon={<LockKeyhole aria-hidden className="size-4" />}
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        placeholder="أعد كتابة كلمة المرور"
        required
        type="password"
      />
      {state.message ? (
        <p className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-bold leading-6 sm:col-span-2 ${state.success ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.success ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" /> : <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />}
          <span>{state.message}</span>
        </p>
      ) : null}
      <SubmitButton className="sm:col-span-2" disabled={state.success}>{state.success ? "تم إنشاء الحساب" : "إنشاء حساب"}</SubmitButton>
    </form>
  );
}
