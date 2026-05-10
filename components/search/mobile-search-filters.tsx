"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NearMeFilter } from "@/components/search/near-me-filter";
import type { AreaSummary, CategorySummary } from "@/lib/data/marketplace";
import { languageLabels, paymentMethodLabels, priceRangeLabels, serviceModeLabels } from "@/lib/data/marketplace";

type MobileSearchFiltersProps = {
  areas: AreaSummary[];
  categories: CategorySummary[];
  params: Record<string, string | undefined>;
  showPriceFilter?: boolean;
};

const fieldClass = "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm";

export function MobileSearchFilters({ areas, categories, params, showPriceFilter }: MobileSearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    params.category,
    params.area,
    params.rating,
    params.priceRange,
    params.serviceMode,
    params.openNow,
    params.language,
    params.payment,
    params.sort,
    params.maxDistance,
    params.near,
  ].filter(Boolean).length;

  return (
    <div className="mb-6 md:hidden">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white"
          type="button"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          خيارات البحث{activeCount ? ` (${activeCount})` : ""}
        </button>
        <NearMeFilter />
        </div>
        {activeCount ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-500">تم تطبيق {activeCount} فلتر</span>
            <Link className="text-xs font-black text-orange-600" href="/search">مسح الفلاتر</Link>
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[1300] bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-label="خيارات البحث">
          <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-base font-black text-slate-950">خيارات البحث</h2>
              <button className="grid size-9 place-items-center rounded-lg hover:bg-slate-100" type="button" onClick={() => setOpen(false)} aria-label="إغلاق">
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <form className="grid gap-3 overflow-y-auto p-4" action="/search">
              <input type="hidden" name="q" value={params.q ?? ""} />
              <input type="hidden" name="lat" value={params.lat ?? ""} />
              <input type="hidden" name="lng" value={params.lng ?? ""} />
              <input type="hidden" name="near" value={params.near ?? ""} />

              <select className={fieldClass} name="category" defaultValue={params.category ?? ""}>
                <option value="">كل الفئات</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <select className={fieldClass} name="area" defaultValue={params.area ?? ""}>
                <option value="">كل المناطق</option>
                {areas.map((area) => <option key={area.id} value={area.slug}>{area.name}</option>)}
              </select>
              <select className={fieldClass} name="rating" defaultValue={params.rating ?? ""}>
                <option value="">كل التقييمات</option>
                <option value="4">4+ نجوم</option>
                <option value="4.5">4.5+ نجوم</option>
              </select>
              {showPriceFilter ? (
                <select className={fieldClass} name="priceRange" defaultValue={params.priceRange ?? ""}>
                  <option value="">كل الأسعار</option>
                  {Object.entries(priceRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              ) : null}
              <select className={fieldClass} name="serviceMode" defaultValue={params.serviceMode ?? ""}>
                <option value="">كل أنواع الخدمة</option>
                {Object.entries(serviceModeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select className={fieldClass} name="openNow" defaultValue={params.openNow ?? ""}>
                <option value="">كل الأوقات</option>
                <option value="1">مفتوح الآن</option>
              </select>
              <select className={fieldClass} name="language" defaultValue={params.language ?? ""}>
                <option value="">كل اللغات</option>
                {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select className={fieldClass} name="payment" defaultValue={params.payment ?? ""}>
                <option value="">كل طرق الدفع</option>
                {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select className={fieldClass} name="sort" defaultValue={params.sort ?? ""}>
                <option value="">الأفضل أولاً</option>
                <option value="distance">الأقرب أولاً</option>
              </select>
              <input className={fieldClass} name="maxDistance" placeholder="أقصى مسافة كم" defaultValue={params.maxDistance ?? ""} />

              <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">
                تطبيق الفلاتر
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
