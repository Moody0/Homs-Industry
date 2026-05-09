import { BusinessCard } from "@/components/business/business-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchSuggestionsInput } from "@/components/search/search-suggestions-input";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { businessListSelect, getActiveAreas, getActiveCategories, normalizeBusinesses } from "@/lib/data/marketplace";
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

  const selectedCategory = categories.find((category) => category.id === params.category);
  const { data: rpcResults } = await supabase.rpc("search_businesses", {
    area_filter: params.area || null,
    category_slug: selectedCategory?.slug ?? null,
    min_rating: params.rating ? Number(params.rating) : null,
    search_query: query || null,
  });
  const resultIds = ((rpcResults ?? []) as { id: string }[]).map((business) => business.id).slice(0, 24);
  const { data } = resultIds.length
    ? await supabase.from("businesses").select(businessListSelect).in("id", resultIds)
    : { data: [] };
  const businesses = normalizeBusinesses(data).sort(
    (a, b) => resultIds.indexOf(a.id) - resultIds.indexOf(b.id),
  );

  const { data: pricedProducts } = await supabase
    .from("business_products")
    .select("id")
    .not("price", "is", null)
    .limit(1);

  return (
    <Container className="py-10">
      <section className="mb-6 rounded-lg bg-[#071018] p-6 text-white">
        <h1 className="text-3xl font-black">البحث في صناعة حمص</h1>
        <p className="mt-2 text-sm text-white/70">ابحث باسم المحل، الخدمة، المنطقة، أو الفئة.</p>
        <div className="mt-5 max-w-2xl"><SearchSuggestionsInput defaultValue={query} /></div>
      </section>

      <SearchFilters areas={areas} categories={categories} params={params} showPriceFilter={Boolean(pricedProducts?.length)} />

      {businesses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business) => <BusinessCard business={business} key={business.id} />)}
        </div>
      ) : <EmptyState title="لا توجد نتائج" description="جرّب كلمات بحث أو فلاتر مختلفة." />}
    </Container>
  );
}
