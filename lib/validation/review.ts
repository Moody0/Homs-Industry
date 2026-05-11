import { z } from "zod";

export const reviewSchema = z.object({
  businessId: z.string().trim().pipe(z.guid("تعذر تحديد المحل لهذا التقييم. حدّث الصفحة وحاول مرة أخرى.")),
  rating: z.coerce.number().int().min(1, "اختر تقييماً").max(5, "أعلى تقييم هو 5"),
  qualityRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  serviceRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  valueRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  comment: z.string().trim().max(1000, "التعليق طويل جداً").optional(),
});
