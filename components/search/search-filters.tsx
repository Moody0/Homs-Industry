import type { AreaSummary, CategorySummary } from "@/lib/data/marketplace";
import { languageLabels, paymentMethodLabels, priceRangeLabels, serviceModeLabels } from "@/lib/data/marketplace";
import { MobileSearchFilters } from "@/components/search/mobile-search-filters";
import { NearMeFilter } from "@/components/search/near-me-filter";

type SearchFiltersProps = {
  areas: AreaSummary[];
  categories: CategorySummary[];
  params: Record<string, string | undefined>;
  showPriceFilter?: boolean;
};

export function SearchFilters({ areas, categories, params, showPriceFilter }: SearchFiltersProps) {
  return (
    <>
      <MobileSearchFilters areas={areas} categories={categories} params={params} showPriceFilter={showPriceFilter} />
      <form className="mb-6 hidden gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid md:grid-cols-4 xl:grid-cols-6">
        <input type="hidden" name="q" value={params.q ?? ""} />
        <input type="hidden" name="lat" value={params.lat ?? ""} />
        <input type="hidden" name="lng" value={params.lng ?? ""} />
        <input type="hidden" name="near" value={params.near ?? ""} />
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="category" defaultValue={params.category ?? ""}>
          <option value="">كل الفئات</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="area" defaultValue={params.area ?? ""}>
          <option value="">كل المناطق</option>
          {areas.map((area) => <option key={area.id} value={area.slug}>{area.name}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="rating" defaultValue={params.rating ?? ""}>
          <option value="">كل التقييمات</option>
          <option value="4">4+ نجوم</option>
          <option value="4.5">4.5+ نجوم</option>
        </select>
        {showPriceFilter ? (
          <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="priceRange" defaultValue={params.priceRange ?? ""}>
            <option value="">كل الأسعار</option>
            {Object.entries(priceRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        ) : null}
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="serviceMode" defaultValue={params.serviceMode ?? ""}>
          <option value="">كل أنواع الخدمة</option>
          {Object.entries(serviceModeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="openNow" defaultValue={params.openNow ?? ""}>
          <option value="">كل الأوقات</option>
          <option value="1">مفتوح الآن</option>
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="language" defaultValue={params.language ?? ""}>
          <option value="">كل اللغات</option>
          {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="payment" defaultValue={params.payment ?? ""}>
          <option value="">كل طرق الدفع</option>
          {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="sort" defaultValue={params.sort ?? ""}>
          <option value="">الأفضل أولاً</option>
          <option value="distance">الأقرب أولاً</option>
        </select>
        <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="maxDistance" placeholder="أقصى مسافة كم" defaultValue={params.maxDistance ?? ""} />
        <NearMeFilter />
        <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
      </form>
    </>
  );
}
