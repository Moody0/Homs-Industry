import { z } from "zod";

export const addBusinessSchema = z.object({
  name: z.string().trim().min(3, "اسم المحل مطلوب"),
  categoryId: z.string().uuid("اختر الفئة"),
  subcategoryId: z.string().uuid().nullable(),
  areaId: z.string().uuid("اختر المنطقة"),
  description: z.string().trim().min(10, "الوصف يجب أن يكون أوضح"),
  phone: z.string().trim().min(6, "رقم الهاتف مطلوب"),
  whatsappPhone: z.string().trim().nullable(),
  address: z.string().trim().min(3, "العنوان مطلوب"),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  services: z.string().optional(),
  products: z.string().optional(),
});
