import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      description="سيتم إنشاء الحساب بالبريد الإلكتروني وكلمة المرور، مع حفظ بيانات التواصل في الملف الشخصي."
      footerHref="/login"
      footerLinkText="تسجيل دخول"
      footerText="لديك حساب بالفعل؟"
      title="إنشاء حساب"
    >
      <RegisterForm />
    </AuthShell>
  );
}
