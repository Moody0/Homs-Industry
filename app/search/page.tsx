import { BusinessCard } from "@/components/business/business-card";
import { BusinessMap } from "@/components/search/business-map";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchSuggestionsInput } from "@/components/search/search-suggestions-input";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import {
  businessListSelect,
  getActiveAreas,
  getActiveCategories,
  languageLabels,
  normalizeBusinesses,
  paymentMethodLabels,
  priceRangeLabels,
  serviceModeLabels,
} from "@/lib/data/marketplace";
import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const [areas, categories] = await Promise.all([
    getActiveAreas(supabase),
    getActiveCategories(supabase),
  ]);
  const query = params.q ?? "";
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8);
  const lat = params.lat ? Number(params.lat) : null;
  const lng = params.lng ? Number(params.lng) : null;
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

  const selectedCategory = categories.find((category) => category.slug === params.category || category.id === params.category);
  const normalizedParams = {
    ...params,
    category: selectedCategory?.slug ?? params.category,
  };
  const { data: rpcResults, error: searchV2Error } = await supabase.rpc("search_businesses_v2", {
    area_filter: params.area || null,
    category_slug: selectedCategory?.slug ?? null,
    current_day_filter: now.getDay(),
    current_time_filter: currentTime,
    language_filter: params.language || null,
    max_distance_km: params.maxDistance ? Number(params.maxDistance) : null,
    min_rating: params.rating ? Number(params.rating) : null,
    open_now: params.openNow === "1",
    payment_filter: params.payment || null,
    price_filter: params.priceRange || null,
    search_query: query || null,
    service_mode_filter: params.serviceMode || null,
    sort_by: params.sort || (params.near === "1" ? "distance" : null),
    user_lat: hasLocation ? lat : null,
    user_lng: hasLocation ? lng : null,
  });

  const fallbackResults = searchV2Error
    ? await supabase.rpc("search_businesses", {
        area_filter: params.area || null,
        category_slug: selectedCategory?.slug ?? null,
        min_rating: params.rating ? Number(params.rating) : null,
        search_query: query || null,
      })
    : { data: null };

  const resultRows = searchV2Error
    ? ((fallbackResults.data ?? []) as { id: string }[]).map((business) => ({ id: business.id, distance_km: null })).slice(0, 48)
    : ((rpcResults ?? []) as { id: string; distance_km: number | string | null }[]).slice(0, 48);
  const resultIds = resultRows.map((business) => business.id);
  const distances = new Map(resultRows.map((business) => [business.id, business.distance_km]));
  const { data } = resultIds.length
    ? await supabase.from("businesses").select(businessListSelect).in("id", resultIds)
    : { data: [] };
  const businesses = normalizeBusinesses(data).sort(
    (a, b) => resultIds.indexOf(a.id) - resultIds.indexOf(b.id),
  ).map((business) => {
    const distance = distances.get(business.id);
    return { ...business, distance_km: distance === null || distance === undefined ? null : Number(distance) };
  });
  const selectedArea = areas.find((area) => area.slug === params.area);
  const activeFilters = [
    query ? `بحث: ${query}` : null,
    selectedCategory ? selectedCategory.name : null,
    selectedArea ? selectedArea.name : null,
    params.rating ? `${params.rating}+ نجوم` : null,
    params.priceRange ? priceRangeLabels[params.priceRange] ?? params.priceRange : null,
    params.serviceMode ? serviceModeLabels[params.serviceMode] ?? params.serviceMode : null,
    params.openNow === "1" ? "مفتوح الآن" : null,
    params.language ? languageLabels[params.language] ?? params.language : null,
    params.payment ? paymentMethodLabels[params.payment] ?? params.payment : null,
    params.near === "1" ? "قريب مني" : null,
  ].filter(Boolean);
  const hasMap = businesses.some((business) => business.latitude && business.longitude);

  return (
    <Container className="pb-24 pt-5 sm:py-10">
      <section className="relative z-20 mb-5 rounded-lg bg-[#071018] p-5 text-white shadow-sm sm:p-6 md:p-8">
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-black text-orange-400">اكتشف الخدمات القريبة منك</p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">البحث في صناعة حمص</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">ابحث باسم المحل، الخدمة، المنتج، المنطقة، أو الفئة.</p>
            <div className="mt-5 max-w-2xl"><SearchSuggestionsInput defaultValue={query} /></div>
          </div>
        </div>
        {activeFilters.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-black text-white ring-1 ring-white/10" key={String(filter)}>{filter}</span>)}
            <ButtonLink className="h-7 rounded-md border-white/15 bg-transparent px-2.5 text-xs text-white hover:bg-white/10 hover:text-white" href="/search" size="sm" variant="outline">مسح</ButtonLink>
          </div>
        ) : null}
      </section>

      <SearchFilters areas={areas} categories={categories} params={normalizedParams} showPriceFilter />

      {hasMap ? (
        <>
          <details className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:hidden">
            <summary className="cursor-pointer px-4 py-3 text-sm font-black text-slate-950">عرض الخريطة القريبة</summary>
            <div className="border-t border-slate-100 p-3">
              <BusinessMap businesses={businesses} userLocation={hasLocation ? { lat: lat as number, lng: lng as number } : null} />
            </div>
          </details>
          <div className="mb-6 hidden md:block">
          <BusinessMap businesses={businesses} userLocation={hasLocation ? { lat: lat as number, lng: lng as number } : null} />
          </div>
        </>
      ) : null}

      {businesses.length > 0 ? (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">النتائج</h2>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{businesses.length} محل</span>
        </div>
      ) : null}

      {businesses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {businesses.map((business) => <BusinessCard business={business} key={business.id} />)}
        </div>
      ) : <EmptyState title="لا توجد نتائج" description="جرّب تغيير كلمات البحث أو مسح الفلاتر الحالية." action={<ButtonLink href="/search">مسح الفلاتر</ButtonLink>} />}
    </Container>
  );
}
