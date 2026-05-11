import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { businessListSelect, normalizeBusinesses } from "@/lib/data/marketplace";

function escapeSearchTerm(value: string) {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", " ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [], results: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_businesses_v2", {
    area_filter: null,
    category_slug: null,
    current_day_filter: null,
    current_time_filter: null,
    language_filter: null,
    max_distance_km: null,
    min_rating: null,
    open_now: false,
    payment_filter: null,
    price_filter: null,
    search_query: query,
    service_mode_filter: null,
    sort_by: null,
    user_lat: null,
    user_lng: null,
  });

  if (error) {
    return NextResponse.json({ suggestions: [], results: [] });
  }

  const rpcIds = ((data ?? []) as { id: string }[]).map((item) => item.id).slice(0, 8);
  const searchPattern = `%${escapeSearchTerm(query)}%`;
  const [rpcBusinesses, directBusinesses, categoryMatches, areaMatches] = await Promise.all([
    rpcIds.length
      ? supabase.from("businesses").select(businessListSelect).in("id", rpcIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("businesses")
      .select(businessListSelect)
      .eq("status", "approved")
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},area.ilike.${searchPattern},address.ilike.${searchPattern},phone.ilike.${searchPattern}`)
      .limit(8),
    supabase
      .from("categories")
      .select("name")
      .eq("is_active", true)
      .ilike("name", searchPattern)
      .limit(5),
    supabase
      .from("areas")
      .select("name")
      .ilike("name", searchPattern)
      .limit(5),
  ]);

  const businessMap = new Map(
    normalizeBusinesses([...(rpcBusinesses.data ?? []), ...(directBusinesses.data ?? [])]).map((business) => [business.id, business]),
  );
  const normalizedBusinesses = Array.from(businessMap.values()).sort(
    (a, b) => {
      const aIndex = rpcIds.indexOf(a.id);
      const bIndex = rpcIds.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name, "ar");
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    },
  );
  const suggestions = Array.from(
    new Set(
      [
        ...normalizedBusinesses.flatMap((item) => [item.name, item.area, item.category?.name, item.subcategory?.name]),
        ...((categoryMatches.data ?? []) as { name: string }[]).map((item) => item.name),
        ...((areaMatches.data ?? []) as { name: string }[]).map((item) => item.name),
      ]
        .filter(Boolean),
    ),
  ).slice(0, 10);
  const results = normalizedBusinesses.slice(0, 5).map((business) => ({
    area: business.area,
    category: business.subcategory?.name ?? business.category?.name ?? "خدمات صناعية",
    name: business.name,
    phone: business.phone,
    rating: business.rating_average,
    reviewsCount: business.reviews_count,
    slug: business.slug,
  }));

  return NextResponse.json({ suggestions, results });
}
