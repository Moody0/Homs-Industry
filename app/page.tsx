import { AdsSlider } from "@/components/home/ads-slider";
import { CategoriesRow } from "@/components/home/categories-row";
import { HeroSearch } from "@/components/home/hero-search";
import { LatestBusinesses } from "@/components/home/latest-businesses";
import { TopRatedList } from "@/components/home/top-rated-list";
import { Container } from "@/components/ui/container";
import {
  businessListSelect,
  fallbackBusinesses,
  fallbackCategories,
  fallbackHomeHero,
  fallbackHomeAds,
  getActiveCategories,
  normalizeBusinesses,
  type HomeAd,
  type HomeHeroSettings,
} from "@/lib/data/marketplace";
import { createClient } from "@/lib/supabase/server";

async function getHomeData() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [categories, heroResult, adsResult, latestResult, topRatedResult] = await Promise.all([
    getActiveCategories(supabase),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "home_hero")
      .maybeSingle(),
    supabase
      .from("ads")
      .select("id, title, description, link_url, image_url, alt_text")
      .eq("is_active", true)
      .eq("type", "home_slider")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("priority", { ascending: false })
      .limit(4),
    supabase
      .from("businesses")
      .select(businessListSelect)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("businesses")
      .select(businessListSelect)
      .eq("status", "approved")
      .order("rating_average", { ascending: false })
      .order("reviews_count", { ascending: false })
      .limit(3),
  ]);

  const latestBusinesses = normalizeBusinesses(latestResult.data);
  const topRatedBusinesses = normalizeBusinesses(topRatedResult.data);
  const heroValue = heroResult.data?.value as Partial<HomeHeroSettings> | null | undefined;

  return {
    ads: ((adsResult.data?.length ? adsResult.data : fallbackHomeAds) ?? []) as HomeAd[],
    categories: categories.length ? categories : fallbackCategories,
    hero: heroValue?.image_url ? { ...fallbackHomeHero, ...heroValue } : fallbackHomeHero,
    latestBusinesses: latestBusinesses.length ? latestBusinesses : fallbackBusinesses,
    topRatedBusinesses: topRatedBusinesses.length ? topRatedBusinesses : fallbackBusinesses.slice(0, 3),
  };
}

export default async function Home() {
  const { categories, ads, hero, latestBusinesses, topRatedBusinesses } = await getHomeData();

  return (
    <>
      <HeroSearch ad={ads[0]} hero={hero} />
      <AdsSlider ads={ads} />
      <CategoriesRow categories={categories} />
      <Container className="grid items-start gap-6 bg-slate-50 pb-10 lg:grid-cols-[320px_1fr]">
        <TopRatedList businesses={topRatedBusinesses} />
        <LatestBusinesses businesses={latestBusinesses} />
      </Container>
    </>
  );
}
