import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/supabase/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      description="ادخل بالبريد الإلكتروني أو اسم المستخدم وكلمة المرور."
      footerHref="/register"
      footerLinkText="إنشاء حساب جديد"
      footerText="ليس لديك حساب؟"
      title="تسجيل دخول"
    >
      {params.created === "1" ? (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold leading-6 text-green-700">
          <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>تم إنشاء حسابك بنجاح. سجّل الدخول للمتابعة.</span>
        </p>
      ) : null}
      <LoginForm />
    </AuthShell>
  );
}
