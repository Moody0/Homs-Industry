import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      description="ادخل بالبريد الإلكتروني أو اسم المستخدم. رسائل الخطأ موحدة لحماية الحسابات من التعداد."
      footerHref="/register"
      footerLinkText="إنشاء حساب جديد"
      footerText="ليس لديك حساب؟"
      title="تسجيل دخول"
    >
      <LoginForm />
    </AuthShell>
  );
}
