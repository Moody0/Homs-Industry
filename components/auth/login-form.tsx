"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, LockKeyhole, UserRound } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      identifier: String(formData.get("identifier") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setMessage("البريد الإلكتروني/اسم المستخدم أو كلمة المرور غير صحيحة.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <AuthField
        autoComplete="username"
        dir="ltr"
        id="identifier"
        icon={<UserRound aria-hidden className="size-4" />}
        label="البريد الإلكتروني أو اسم المستخدم"
        name="identifier"
        placeholder="name@email.com أو اسم المستخدم"
        required
      />
      <AuthField
        autoComplete="current-password"
        id="password"
        icon={<LockKeyhole aria-hidden className="size-4" />}
        label="كلمة المرور"
        name="password"
        placeholder="أدخل كلمة المرور"
        required
        type="password"
      />
      {message ? (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </p>
      ) : null}
      <SubmitButton disabled={pending}>{pending ? "جار تسجيل الدخول..." : "تسجيل دخول"}</SubmitButton>
    </form>
  );
}
