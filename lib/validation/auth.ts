import { z } from "zod";

const arabicIndicDigits: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

export const genericAuthError =
  "تعذر تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "الاسم الكامل مطلوب"),
    email: z.email("أدخل بريداً إلكترونياً صحيحاً").trim().toLowerCase(),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
      .regex(/^[a-z0-9_]+$/, "استخدم أحرف إنكليزية وأرقام وشرطة سفلية فقط"),
    phone: z.string().trim().min(1, "رقم الهاتف مطلوب"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "أدخل البريد الإلكتروني أو اسم المستخدم"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export function normalizeDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => arabicIndicDigits[digit] ?? digit);
}

export function normalizeSyrianPhone(value: string) {
  const compact = normalizeDigits(value)
    .trim()
    .replace(/[\s().-]/g, "");

  if (/^\+9639\d{8}$/.test(compact)) {
    return compact;
  }

  if (/^009639\d{8}$/.test(compact)) {
    return `+${compact.slice(2)}`;
  }

  if (/^9639\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^09\d{8}$/.test(compact)) {
    return `+963${compact.slice(1)}`;
  }

  if (/^9\d{8}$/.test(compact)) {
    return `+963${compact}`;
  }

  return null;
}

export function isLikelyPhoneIdentifier(value: string) {
  const compact = normalizeDigits(value).trim().replace(/[\s().-]/g, "");
  return /^\+?\d+$/.test(compact);
}
