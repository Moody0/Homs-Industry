import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const adminUuidSchema = z.string().uuid("المعرّف غير صالح");

export const businessStatusSchema = z.enum(["pending", "approved", "rejected"], {
  error: "حالة المحل غير صالحة",
});

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"], {
  error: "حالة التقييم غير صالحة",
});

export const adTypeSchema = z.enum(["home_slider", "featured_business", "category_ad"], {
  error: "نوع الإعلان غير صالح",
});

export const adminSlugSchema = z
  .string()
  .trim()
  .min(2, "الرابط المختصر مطلوب")
  .regex(slugRegex, "استخدم أحرف إنكليزية صغيرة وأرقام وشرطات فقط");

export const optionalAdminLinkSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith("/")) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "الرابط يجب أن يكون مساراً داخلياً يبدأ بـ / أو رابطاً صحيحاً");

export const adminDateSchema = z
  .string()
  .trim()
  .regex(dateRegex, "أدخل تاريخاً صحيحاً");

export const adminBooleanSchema = z
  .string()
  .optional()
  .transform((value) => value === "true");

export const adminNumberSchema = z.coerce.number().int("القيمة يجب أن تكون رقماً صحيحاً");

export const businessIdSchema = z.object({
  businessId: adminUuidSchema,
});

export const rejectBusinessSchema = businessIdSchema.extend({
  rejectionReason: z.string().trim().min(3, "سبب الرفض مطلوب").max(500, "سبب الرفض طويل جداً"),
});

export const toggleBusinessFeaturedSchema = businessIdSchema.extend({
  isFeatured: adminBooleanSchema,
});

export const updateBusinessSchema = businessIdSchema.extend({
  area: z.string().trim().min(2, "المنطقة مطلوبة").max(120, "المنطقة طويلة جداً"),
  name: z.string().trim().min(2, "اسم المحل مطلوب").max(160, "اسم المحل طويل جداً"),
  phone: z.string().trim().min(5, "رقم الهاتف مطلوب").max(40, "رقم الهاتف طويل جداً"),
  status: businessStatusSchema,
});

export const categoryUpsertSchema = z.object({
  categoryId: adminUuidSchema.optional().nullable(),
  description: z.string().trim().max(500, "الوصف طويل جداً").optional().nullable(),
  existingImageUrl: z.string().trim().optional().nullable(),
  iconName: z.string().trim().max(80, "اسم الأيقونة طويل جداً").optional().nullable(),
  isActive: adminBooleanSchema,
  name: z.string().trim().min(2, "اسم الفئة مطلوب").max(120, "اسم الفئة طويل جداً"),
  slug: adminSlugSchema,
  sortOrder: adminNumberSchema.default(0),
});

export const categoryIdSchema = z.object({
  categoryId: adminUuidSchema,
});

export const subcategoryUpsertSchema = z.object({
  categoryId: adminUuidSchema,
  description: z.string().trim().max(500, "الوصف طويل جداً").optional().nullable(),
  isActive: adminBooleanSchema,
  name: z.string().trim().min(2, "اسم الفئة الفرعية مطلوب").max(120, "اسم الفئة الفرعية طويل جداً"),
  slug: adminSlugSchema,
  sortOrder: adminNumberSchema.default(0),
  subcategoryId: adminUuidSchema.optional().nullable(),
});

export const subcategoryIdSchema = z.object({
  subcategoryId: adminUuidSchema,
});

export const adUpsertSchema = z
  .object({
    adId: adminUuidSchema.optional().nullable(),
    altText: z.string().trim().max(200, "وصف الصورة طويل جداً").optional().nullable(),
    businessId: adminUuidSchema.optional().nullable(),
    categoryId: adminUuidSchema.optional().nullable(),
    description: z.string().trim().max(500, "الوصف طويل جداً").optional().nullable(),
    endDate: adminDateSchema,
    existingImageUrl: z.string().trim().optional().nullable(),
    isActive: adminBooleanSchema,
    linkUrl: optionalAdminLinkSchema,
    priority: adminNumberSchema.default(0),
    startDate: adminDateSchema,
    title: z.string().trim().min(2, "عنوان الإعلان مطلوب").max(160, "عنوان الإعلان طويل جداً"),
    type: adTypeSchema,
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية",
    path: ["endDate"],
  });

export const adIdSchema = z.object({
  adId: adminUuidSchema,
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"], { error: "الدور غير صالح" }),
  userId: adminUuidSchema,
});

export const reviewIdSchema = z.object({
  reviewId: adminUuidSchema,
});

export const reviewModerationSchema = reviewIdSchema.extend({
  status: reviewStatusSchema,
});
