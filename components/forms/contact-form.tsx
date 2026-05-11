"use client";

import { useActionState } from "react";
import { Mail, MessageSquareText, Phone, UserRound } from "lucide-react";
import { sendContactMessageAction, type ContactActionState } from "@/actions/contact";
import { AuthField } from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const initialState: ContactActionState = { message: "" };

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessageAction, initialState);

  return (
    <Card id="contact-form" className="scroll-mt-24">
      <CardHeader>
        <p className="text-sm font-black text-orange-600">إرسال ملاحظة</p>
        <h2 className="text-2xl font-black text-slate-950">اكتب لنا مباشرة</h2>
        <p className="text-sm leading-7 text-slate-600">أرسل اقتراحاً، مشكلة في بيانات محل، أو أي طلب يحتاج متابعة من فريق صناعة حمص.</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField icon={<UserRound aria-hidden className="size-4" />} id="name" label="الاسم" name="name" placeholder="اسمك الكامل" required />
            <AuthField icon={<Mail aria-hidden className="size-4" />} id="email" label="البريد الإلكتروني" name="email" placeholder="name@email.com" required type="email" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField icon={<Phone aria-hidden className="size-4" />} id="phone" label="رقم الهاتف" name="phone" placeholder="اختياري" />
            <label className="grid gap-2" htmlFor="topic">
              <span className="text-sm font-black text-slate-800">موضوع الرسالة</span>
              <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" id="topic" name="topic" required>
                <option value="">اختر الموضوع</option>
                <option value="اقتراح لتحسين الدليل">اقتراح لتحسين الدليل</option>
                <option value="تصحيح بيانات محل">تصحيح بيانات محل</option>
                <option value="بلاغ عن مشكلة">بلاغ عن مشكلة</option>
                <option value="طلب تعاون">طلب تعاون</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2" htmlFor="message">
            <span className="flex items-center gap-2 text-sm font-black text-slate-800">
              <MessageSquareText aria-hidden className="size-4 text-slate-400" />
              الرسالة
            </span>
            <textarea
              className="min-h-36 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="message"
              name="message"
              placeholder="اكتب التفاصيل التي تريد إيصالها لنا..."
              required
            />
          </label>
          {state.message ? (
            <p className={state.success ? "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700" : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"}>
              {state.message}
            </p>
          ) : null}
          <SubmitButton>إرسال الرسالة</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
