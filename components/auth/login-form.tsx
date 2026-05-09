"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = { message: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <AuthField
        autoComplete="username"
        dir="ltr"
        id="identifier"
        label="البريد الإلكتروني أو اسم المستخدم"
        name="identifier"
        placeholder="admin@example.com أو admin"
        required
      />
      <AuthField
        autoComplete="current-password"
        id="password"
        label="كلمة المرور"
        name="password"
        placeholder="أدخل كلمة المرور"
        required
        type="password"
      />
      {state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.message}
        </p>
      ) : null}
      <SubmitButton>تسجيل دخول</SubmitButton>
    </form>
  );
}
