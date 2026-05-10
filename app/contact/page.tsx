import { Clock3, MailQuestion, MapPin, MessageSquareText, PlusCircle, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const contactPaths = [
  {
    title: "إضافة محل جديد",
    description: "أرسل بيانات محلك وصوره ليتم مراجعتها من الإدارة.",
    href: "/add-business",
    label: "إضافة محل",
    icon: PlusCircle,
  },
  {
    title: "إدارة محل موجود",
    description: "حدّث بيانات محلك، ساعات العمل، الخدمات، الصور، والردود.",
    href: "/dashboard",
    label: "لوحة صاحب المحل",
    icon: ShieldCheck,
  },
  {
    title: "اقتراح أو ملاحظة",
    description: "ابحث عن المحل المطلوب واستخدم البلاغات أو التقييمات لإيصال الملاحظات.",
    href: "/search",
    label: "البحث في الدليل",
    icon: MessageSquareText,
  },
];

export default function ContactPage() {
  return (
    <Container className="py-10">
      <section className="mb-8 overflow-hidden rounded-lg bg-[#071018] p-6 text-white md:p-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-black text-orange-400">
            <MailQuestion aria-hidden className="size-5" />
            تواصل معنا
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">نحن هنا لمساعدة أصحاب المحلات والزوار</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
            اختر المسار المناسب حسب طلبك، سواء كنت تريد إضافة محل، تعديل بياناته، أو إرسال ملاحظة حول تجربة داخل الدليل.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {contactPaths.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent className="grid gap-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-orange-50 text-orange-600">
                    <Icon aria-hidden className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                  <ButtonLink className="w-fit" href={item.href} variant="outline">
                    {item.label}
                  </ButtonLink>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-black text-slate-950">معلومات الخدمة</h2>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm leading-7 text-slate-700">
              <p className="inline-flex items-start gap-2">
                <MapPin aria-hidden className="mt-1 size-4 text-orange-600" />
                الدليل مخصص للخدمات الصناعية والمهنية في حمص.
              </p>
              <p className="inline-flex items-start gap-2">
                <Clock3 aria-hidden className="mt-1 size-4 text-orange-600" />
                تتم مراجعة طلبات الإضافة والتوثيق من لوحة الإدارة قبل ظهورها للعامة.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-black text-slate-950">لأصحاب المحلات</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p>بعد تسجيل الدخول يمكنك متابعة حالة طلبك وتحديث بيانات محلك من لوحة صاحب المحل.</p>
              <ButtonLink className="w-full" href="/dashboard">
                فتح لوحة صاحب المحل
              </ButtonLink>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
