import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("search_businesses", {
    area_filter: null,
    category_slug: null,
    min_rating: null,
    search_query: query,
  });

  const suggestions = Array.from(
    new Set(((data ?? []) as { name: string; area: string }[]).flatMap((item) => [item.name, item.area]).filter(Boolean)),
  ).slice(0, 8);

  return NextResponse.json({ suggestions });
}
