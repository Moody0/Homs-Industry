import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Megaphone, Sparkles, Store, Tags } from "lucide-react";
import { SearchSuggestionsInput } from "@/components/search/search-suggestions-input";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { fallbackHomeAds, firstRelation } from "@/lib/data/marketplace";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "الإعلانات والعروض | صناعة حمص",
  description: "اكتشف أحدث إعلانات وعروض المحلات والخدمات الصناعية في حمص.",
};

const adTypeLabels: Record<string, string> = {
  home_slider: "إعلان رئيسي",
  featured_business: "محل مميز",
  category_ad: "إعلان فئة",
};

const adTypeFilters = [
  { label: "الكل", value: "" },
  { label: "الرئيسية", value: "home_slider" },
  { label: "محلات مميزة", value: "featured_business" },
  { label: "الفئات", value: "category_ad" },
];

type AdsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type Relation<T> = T[] | T | null;

type AdRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  alt_text: string | null;
  type: string;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  link_url: string | null;
  business: Relation<{ name: string; slug: string }>;
  category: Relation<{ name: string; slug: string }>;
};

function adHref(ad: AdRow) {
  if (ad.link_url?.trim()) return ad.link_url;

  const business = firstRelation(ad.business);
  if (business?.slug) return `/businesses/${business.slug}`;

  const category = firstRelation(ad.category);
  if (category?.slug) return `/categories/${category.slug}`;

  return "/search";
}

function adContext(ad: AdRow) {
  const business = firstRelation(ad.business);
  if (business?.name) return business.name;

  const category = firstRelation(ad.category);
  if (category?.name) return category.name;

  return "صناعة حمص";
}

function dateRange(ad: AdRow) {
  if (!ad.start_date || !ad.end_date) return "متاح الآن";
  return `${ad.start_date} إلى ${ad.end_date}`;
}

function fallbackAds(): AdRow[] {
  return fallbackHomeAds.map((ad, index) => ({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    image_url: ad.image_url ?? null,
    alt_text: ad.alt_text ?? ad.title,
    type: "home_slider",
    priority: fallbackHomeAds.length - index,
    start_date: null,
    end_date: null,
    link_url: ad.link_url,
    business: null,
    category: null,
  }));
}

async function getActiveAds(typeFilter: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("ads")
    .select("id, title, description, image_url, alt_text, type, priority, start_date, end_date, link_url, business:businesses(name, slug), category:categories(name, slug)")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data } = await query;
  const ads = (data ?? []) as AdRow[];

  if (!typeFilter && ads.length === 0) {
    return fallbackAds();
  }

  return ads;
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const params = await searchParams;
  const typeFilter = adTypeLabels[params.type ?? ""] ? params.type ?? "" : "";
  const ads = await getActiveAds(typeFilter);
  const featuredAd = ads[0];

  return (
    <main className="bg-slate-50 pb-24">
      <section className="bg-[#071018] text-white">
        <Container className="py-7 sm:py-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-black text-orange-400">
              <Megaphone aria-hidden className="size-5" />
              الإعلانات والعروض
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">كل العروض النشطة في مكان واحد</h1>
            <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
              تابع إعلانات المحلات، العروض الموسمية، والفئات المميزة داخل دليل صناعة حمص.
            </p>
            <SearchSuggestionsInput className="mt-5 shadow-lg shadow-black/20" inputPlaceholder="ابحث عن محل أو خدمة" />
          </div>
        </Container>
      </section>

      <Container className="-mt-4 space-y-6">
        <nav className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="تصفية الإعلانات">
          {adTypeFilters.map((filter) => {
            const active = typeFilter === filter.value;
            return (
              <Link
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-black transition ${
                  active ? "bg-orange-500 text-white" : "text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                }`}
                href={filter.value ? `/ads?type=${filter.value}` : "/ads"}
                key={filter.value || "all"}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {featuredAd ? (
          <Link className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-md lg:grid-cols-[1fr_420px]" href={adHref(featuredAd)}>
            <div className="relative min-h-56 bg-slate-200 lg:order-2 lg:min-h-72">
              {featuredAd.image_url ? (
                <Image alt={featuredAd.alt_text ?? featuredAd.title} className="object-cover transition duration-300 group-hover:scale-105" fill priority sizes="(max-width: 1024px) 100vw, 420px" src={featuredAd.image_url} />
              ) : null}
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-7 lg:order-1">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-orange-50 text-orange-700">{adTypeLabels[featuredAd.type] ?? "إعلان"}</Badge>
                <Badge className="bg-slate-100 text-slate-700 ring-slate-200">{adContext(featuredAd)}</Badge>
              </div>
              <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{featuredAd.title}</h2>
              {featuredAd.description ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{featuredAd.description}</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-4 text-orange-500" />
                  {dateRange(featuredAd)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles aria-hidden className="size-4 text-orange-500" />
                  إعلان مميز
                </span>
              </div>
              <span className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-white sm:w-fit">
                مشاهدة الإعلان
                <ArrowLeft aria-hidden className="size-4" />
              </span>
            </div>
          </Link>
        ) : null}

        {ads.length ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">الإعلانات المتاحة</h2>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{ads.length} إعلان</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <Link className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md" href={adHref(ad)} key={ad.id}>
                  <div className="relative h-44 bg-slate-200">
                    {ad.image_url ? (
                      <Image alt={ad.alt_text ?? ad.title} className="object-cover transition duration-300 group-hover:scale-105" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" src={ad.image_url} />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge>{adTypeLabels[ad.type] ?? "إعلان"}</Badge>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {ad.type === "category_ad" ? <Tags aria-hidden className="size-3.5" /> : <Store aria-hidden className="size-3.5" />}
                        {adContext(ad)}
                      </span>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-black text-slate-950 group-hover:text-orange-600">{ad.title}</h3>
                    {ad.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{ad.description}</p> : null}
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                      <span className="line-clamp-1">{dateRange(ad)}</span>
                      <ArrowLeft aria-hidden className="size-5 shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <ButtonLink href="/search">تصفح المحلات</ButtonLink>
                <ButtonLink href="/contact" variant="outline">تواصل معنا</ButtonLink>
              </div>
            }
            description="لا توجد إعلانات نشطة ضمن هذا النوع حالياً. يمكنك متابعة المحلات أو العودة لاحقاً للعروض الجديدة."
            title="لا توجد إعلانات الآن"
          />
        )}
      </Container>
    </main>
  );
}
