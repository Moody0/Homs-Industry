import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("search_businesses_v2", {
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
  const ids = ((data ?? []) as { id: string }[]).map((item) => item.id).slice(0, 8);
  const { data: businesses } = ids.length
    ? await supabase.from("businesses").select("name, area").in("id", ids)
    : { data: [] };

  const suggestions = Array.from(new Set(((businesses ?? []) as { name: string; area: string }[]).flatMap((item) => [item.name, item.area]).filter(Boolean))).slice(0, 8);

  return NextResponse.json({ suggestions });
}
