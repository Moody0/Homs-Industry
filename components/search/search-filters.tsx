import type { AreaSummary, CategorySummary } from "@/lib/data/marketplace";

type SearchFiltersProps = {
  areas: AreaSummary[];
  categories: CategorySummary[];
  params: Record<string, string | undefined>;
  showPriceFilter?: boolean;
};

export function SearchFilters({ areas, categories, params, showPriceFilter }: SearchFiltersProps) {
  return (
    <form className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
      <input type="hidden" name="q" value={params.q ?? ""} />
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
      {showPriceFilter ? <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="maxPrice" placeholder="أعلى سعر" defaultValue={params.maxPrice ?? ""} /> : null}
      <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-black text-white" type="submit">تصفية</button>
    </form>
  );
}
