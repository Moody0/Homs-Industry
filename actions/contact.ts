"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { isRateLimited } from "@/lib/security/rate-limit";

export type ContactActionState = {
  message: string;
  success?: boolean;
};

const contactSchema = z.object({
  email: z.email("أدخل بريداً إلكترونياً صحيحاً").trim().toLowerCase(),
  message: z.string().trim().min(10, "اكتب رسالة أوضح من فضلك").max(3000, "الرسالة طويلة جداً"),
  name: z.string().trim().min(2, "الاسم مطلوب").max(120, "الاسم طويل جداً"),
  phone: z.string().trim().max(40, "رقم الهاتف طويل جداً").optional(),
  topic: z.string().trim().min(2, "اختر موضوع الرسالة").max(120, "موضوع الرسالة طويل جداً"),
});

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendContactMessageAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  void _previousState;

  const parsed = contactSchema.safeParse({
    email: formValue(formData, "email"),
    message: formValue(formData, "message"),
    name: formValue(formData, "name"),
    phone: formValue(formData, "phone") || undefined,
    topic: formValue(formData, "topic"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تعذر إرسال الرسالة" };
  }

  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "غير معروف";
  const forwardedFor = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "غير معروف";
  const rateKey = `contact:${parsed.data.email}:${forwardedFor}`;

  if (isRateLimited(rateKey, 4, 10 * 60_000)) {
    return { message: "وصلتنا محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return { message: "إرسال البريد غير مفعّل بعد. أضف إعدادات Resend في ملف البيئة ثم حاول مجدداً." };
  }

  const resend = new Resend(apiKey);
  const sentAt = new Date().toISOString();
  const phone = parsed.data.phone || "غير مرفق";
  const subject = `رسالة تواصل من صناعة حمص: ${parsed.data.topic}`;
  const text = [
    `الاسم: ${parsed.data.name}`,
    `البريد: ${parsed.data.email}`,
    `الهاتف: ${phone}`,
    `الموضوع: ${parsed.data.topic}`,
    "",
    "الرسالة:",
    parsed.data.message,
    "",
    "بيانات الطلب:",
    `تاريخ الإرسال: ${sentAt}`,
    `IP: ${forwardedFor}`,
    `User-Agent: ${userAgent}`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: fromEmail,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #0f172a;">
        <h2 style="margin: 0 0 16px;">رسالة جديدة من صفحة تواصل معنا</h2>
        <p><strong>الاسم:</strong> ${escapeHtml(parsed.data.name)}</p>
        <p><strong>البريد:</strong> ${escapeHtml(parsed.data.email)}</p>
        <p><strong>الهاتف:</strong> ${escapeHtml(phone)}</p>
        <p><strong>الموضوع:</strong> ${escapeHtml(parsed.data.topic)}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${escapeHtml(parsed.data.message)}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;"><strong>تاريخ الإرسال:</strong> ${escapeHtml(sentAt)}</p>
        <p style="font-size: 12px; color: #64748b;"><strong>IP:</strong> ${escapeHtml(forwardedFor)}</p>
        <p style="font-size: 12px; color: #64748b;"><strong>User-Agent:</strong> ${escapeHtml(userAgent)}</p>
      </div>
    `,
    replyTo: parsed.data.email,
    subject,
    text,
    to: toEmail,
  });

  if (error) {
    return { message: "تعذر إرسال الرسالة الآن. تأكد من إعدادات البريد وحاول مرة أخرى." };
  }

  return { success: true, message: "تم إرسال رسالتك بنجاح. سنراجعها ونرد عليك قريباً." };
}
