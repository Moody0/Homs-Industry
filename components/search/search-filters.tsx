import type { ReactNode } from "react";
import type { AreaSummary, CategorySummary } from "@/lib/data/marketplace";
import { languageLabels, paymentMethodLabels, priceRangeLabels, serviceModeLabels } from "@/lib/data/marketplace";
import { MobileSearchFilters } from "@/components/search/mobile-search-filters";
import { NearMeFilter } from "@/components/search/near-me-filter";
import { cn } from "@/lib/utils";

type SearchFiltersProps = {
  areas: AreaSummary[];
  categories: CategorySummary[];
  params: Record<string, string | undefined>;
  showPriceFilter?: boolean;
};

function FilterField({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <span className="text-xs font-black text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const controlClassName = "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10";

export function SearchFilters({ areas, categories, params, showPriceFilter }: SearchFiltersProps) {
  return (
    <>
      <MobileSearchFilters areas={areas} categories={categories} params={params} showPriceFilter={showPriceFilter} />
      <form className="mb-6 hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:block">
        <input type="hidden" name="q" value={params.q ?? ""} />
        <input type="hidden" name="lat" value={params.lat ?? ""} />
        <input type="hidden" name="lng" value={params.lng ?? ""} />
        <input type="hidden" name="near" value={params.near ?? ""} />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-950">تصفية النتائج</p>
            <p className="mt-1 text-xs font-bold text-slate-500">اختر ما يناسب بحثك ثم طبّق الفلاتر.</p>
          </div>
          <button className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600" type="submit">تصفية</button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <FilterField label="الفئة">
            <select className={controlClassName} name="category" defaultValue={params.category ?? ""}>
              <option value="">كل الفئات</option>
              {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
          </FilterField>
          <FilterField label="المنطقة">
            <select className={controlClassName} name="area" defaultValue={params.area ?? ""}>
              <option value="">كل المناطق</option>
              {areas.map((area) => <option key={area.id} value={area.slug}>{area.name}</option>)}
            </select>
          </FilterField>
          <FilterField label="التقييم">
            <select className={controlClassName} name="rating" defaultValue={params.rating ?? ""}>
              <option value="">كل التقييمات</option>
              <option value="4">4+ نجوم</option>
              <option value="4.5">4.5+ نجوم</option>
            </select>
          </FilterField>
          {showPriceFilter ? (
            <FilterField label="السعر">
              <select className={controlClassName} name="priceRange" defaultValue={params.priceRange ?? ""}>
                <option value="">كل الأسعار</option>
                {Object.entries(priceRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </FilterField>
          ) : null}
          <FilterField label="نوع الخدمة">
            <select className={controlClassName} name="serviceMode" defaultValue={params.serviceMode ?? ""}>
              <option value="">كل أنواع الخدمة</option>
              {Object.entries(serviceModeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FilterField>
          <FilterField label="الوقت">
            <select className={controlClassName} name="openNow" defaultValue={params.openNow ?? ""}>
              <option value="">كل الأوقات</option>
              <option value="1">مفتوح الآن</option>
            </select>
          </FilterField>
          <FilterField label="اللغة">
            <select className={controlClassName} name="language" defaultValue={params.language ?? ""}>
              <option value="">كل اللغات</option>
              {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FilterField>
          <FilterField label="الدفع">
            <select className={controlClassName} name="payment" defaultValue={params.payment ?? ""}>
              <option value="">كل طرق الدفع</option>
              {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FilterField>
          <FilterField label="الترتيب">
            <select className={controlClassName} name="sort" defaultValue={params.sort ?? ""}>
              <option value="">الأفضل أولاً</option>
              <option value="distance">الأقرب أولاً</option>
            </select>
          </FilterField>
          <FilterField label="أقصى مسافة">
            <input className={controlClassName} name="maxDistance" placeholder="مثال: 25 كم" defaultValue={params.maxDistance ?? ""} />
          </FilterField>
          <div className="self-end">
            <NearMeFilter />
          </div>
        </div>
      </form>
    </>
  );
}
