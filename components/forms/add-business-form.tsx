"use client";

import { useActionState } from "react";
import { addBusinessAction, type BusinessActionState } from "@/actions/businesses";
import { AuthField } from "@/components/auth/auth-field";
import { LocationPicker } from "@/components/forms/location-picker";
import { SubmitButton } from "@/components/auth/submit-button";
import { UploadImageField } from "@/components/forms/upload-image-field";
import type { AreaSummary, CategorySummary, SubcategorySummary } from "@/lib/data/marketplace";

type AddBusinessFormProps = {
  areas: AreaSummary[];
  categories: CategorySummary[];
  subcategories: (SubcategorySummary & { category_id: string })[];
};

const initialState: BusinessActionState = { message: "" };

export function AddBusinessForm({ areas, categories, subcategories }: AddBusinessFormProps) {
  const [state, formAction] = useActionState(addBusinessAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <AuthField id="name" label="اسم المحل" name="name" placeholder="مثال: ورشة الكمال" required />
        <label className="grid gap-2" htmlFor="areaId">
          <span className="text-sm font-black text-slate-800">المنطقة</span>
          <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-orange-500" id="areaId" name="areaId" required>
            <option value="">اختر المنطقة</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2" htmlFor="categoryId">
          <span className="text-sm font-black text-slate-800">الفئة</span>
          <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-orange-500" id="categoryId" name="categoryId" required>
            <option value="">اختر الفئة</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2" htmlFor="subcategoryId">
          <span className="text-sm font-black text-slate-800">الفئة الفرعية</span>
          <select className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-orange-500" id="subcategoryId" name="subcategoryId">
            <option value="">بدون فئة فرعية</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2" htmlFor="description">
        <span className="text-sm font-black text-slate-800">وصف مختصر</span>
        <textarea className="min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" id="description" name="description" placeholder="اكتب الخدمات الأساسية التي يقدمها المحل" required />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField id="phone" label="رقم الهاتف" name="phone" placeholder="0933 123 456" required />
        <AuthField id="whatsappPhone" label="واتساب" name="whatsappPhone" placeholder="963933123456" />
      </div>

      <AuthField id="address" label="العنوان" name="address" placeholder="حمص - الحي - الشارع" required />

      <LocationPicker />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2" htmlFor="services">
          <span className="text-sm font-black text-slate-800">الخدمات، كل خدمة بسطر</span>
          <textarea className="min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" id="services" name="services" placeholder="ميكانيك سيارات&#10;فحص كمبيوتر" />
        </label>
        <label className="grid gap-2" htmlFor="products">
          <span className="text-sm font-black text-slate-800">المنتجات، كل منتج بسطر</span>
          <textarea className="min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" id="products" name="products" placeholder="قطع تبديل&#10;زيوت" />
        </label>
      </div>

      <UploadImageField description="اختر حتى 6 صور للمحل. الصورة الأولى تستخدم كغلاف." id="images" label="صور المحل" multiple name="images" />

      {state.message ? (
        <p className={state.success ? "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700" : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton>إرسال طلب إضافة المحل</SubmitButton>
    </form>
  );
}
