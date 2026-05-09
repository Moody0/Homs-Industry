import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/business/business-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { businessListSelect, getActiveAreas, normalizeBusinesses } from "@/lib/data/marketplace";
import { createClient } from "@/lib/supabase/server";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

const pageSize = 9;

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const page = Math.max(1, Number(queryParams.page ?? 1));
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  const [areas, subcategoriesResult] = await Promise.all([
    getActiveAreas(supabase),
    supabase
      .from("subcategories")
      .select("id, name, slug")
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);
  const subcategories = subcategoriesResult.data ?? [];

  let businessesQuery = supabase
    .from("businesses")
    .select(businessListSelect, { count: "exact" })
    .eq("status", "approved")
    .eq("category_id", category.id);

  if (queryParams.area) businessesQuery = businessesQuery.eq("area_id", queryParams.area);
  if (queryParams.rating) businessesQuery = businessesQuery.gte("rating_average", Number(queryParams.rating));
  if (queryParams.subcategory) businessesQuery = businessesQuery.eq("subcategory_id", queryParams.subcategory);

  if (queryParams.sort === "newest") {
    businessesQuery = businessesQuery.order("created_at", { ascending: false });
  } else if (queryParams.sort === "nearest") {
    businessesQuery = businessesQuery.order("latitude", { ascending: true, nullsFirst: false });
  } else {
    businessesQuery = businessesQuery
      .order("rating_average", { ascending: false })
      .order("reviews_count", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await businessesQuery.range(from, to);
  const businesses = normalizeBusinesses(data);
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <Container className="py-10">
      <div className="mb-6 rounded-lg bg-[#071018] p-6 text-white">
        <p className="text-sm font-black text-orange-400">{category.name}</p>
        <h1 className="mt-2 text-3xl font-black">محلات وخدمات {category.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">{category.description}</p>
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="area" defaultValue={queryParams.area ?? ""}>
          <option value="">كل المناطق</option>
          {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="rating" defaultValue={queryParams.rating ?? ""}>
          <option value="">كل التقييمات</option>
          <option value="4">4+ نجوم</option>
          <option value="4.5">4.5+ نجوم</option>
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="subcategory" defaultValue={queryParams.subcategory ?? ""}>
          <option value="">كل الفئات الفرعية</option>
          {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm" name="sort" defaultValue={queryParams.sort ?? "top-rated"}>
          <option value="top-rated">الأعلى تقييماً</option>
          <option value="newest">الأحدث</option>
          <option value="nearest">الأقرب</option>
        </select>
        <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-black text-white md:col-span-4" type="submit">تطبيق الفلاتر</button>
      </form>

      {businesses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => <BusinessCard business={business} key={business.id} />)}
        </div>
      ) : (
        <EmptyState title="لا توجد محلات مطابقة" description="جرّب تعديل الفلاتر أو البحث في فئة أخرى." />
      )}

      <Pagination basePath={`/categories/${slug}`} page={page} searchParams={queryParams} totalPages={totalPages} />
    </Container>
  );
}
