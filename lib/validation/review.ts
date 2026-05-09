import { z } from "zod";

export const reviewSchema = z.object({
  businessId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "اختر تقييماً").max(5, "أعلى تقييم هو 5"),
  comment: z.string().trim().max(1000, "التعليق طويل جداً").optional(),
});
