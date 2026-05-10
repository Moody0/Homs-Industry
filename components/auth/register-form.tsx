"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "" };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <AuthField
        autoComplete="name"
        id="fullName"
        label="الاسم الكامل"
        name="fullName"
        placeholder="مثال: أحمد الخطيب"
        required
      />
      <AuthField
        autoComplete="email"
        dir="ltr"
        id="email"
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
        label="اسم المستخدم"
        name="username"
        placeholder="ahmad_123"
        required
      />
      <AuthField
        autoComplete="tel"
        dir="ltr"
        id="phone"
        label="رقم الهاتف"
        name="phone"
        placeholder="09xxxxxxxx"
        required
        type="tel"
      />
      <AuthField
        autoComplete="new-password"
        id="password"
        label="كلمة المرور"
        name="password"
        placeholder="8 أحرف على الأقل"
        required
        type="password"
      />
      <AuthField
        autoComplete="new-password"
        id="confirmPassword"
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        placeholder="أعد كتابة كلمة المرور"
        required
        type="password"
      />
      {state.message ? (
        <p className={`rounded-lg border px-4 py-3 text-sm font-bold ${state.success ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>إنشاء حساب</SubmitButton>
    </form>
  );
}
