import type { SupabaseClient } from "@supabase/supabase-js";

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  image_url: string | null;
};

export type SubcategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type AreaSummary = {
  id: string;
  name: string;
  slug: string;
};

export type HomeAd = {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  image_url?: string | null;
  alt_text?: string | null;
};

export type HomeHeroSettings = {
  image_url: string;
  alt_text?: string | null;
};

export type BusinessSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp_phone: string | null;
  address: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  is_verified: boolean;
  is_trusted: boolean;
  price_range: string | null;
  service_modes: string[];
  languages: string[];
  payment_methods: string[];
  years_experience: number | null;
  owner_bio: string | null;
  team_info: string | null;
  brochure_url: string | null;
  rating_average: number;
  reviews_count: number;
  distance_km?: number | null;
  cover_image_url: string | null;
  logo_url: string | null;
  category_id: string;
  subcategory_id: string | null;
  area_id?: string | null;
  owner_id: string | null;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
};

type BusinessRow = Omit<BusinessSummary, "category" | "subcategory"> & {
  category: { name: string; slug: string }[] | { name: string; slug: string } | null;
  subcategory: { name: string; slug: string }[] | { name: string; slug: string } | null;
};

export const businessListSelect =
  "id, name, slug, description, phone, whatsapp_phone, address, area, latitude, longitude, status, is_featured, is_verified, is_trusted, price_range, service_modes, languages, payment_methods, years_experience, owner_bio, team_info, brochure_url, rating_average, reviews_count, cover_image_url, logo_url, category_id, subcategory_id, area_id, owner_id, category:categories(name, slug), subcategory:subcategories!businesses_subcategory_id_fkey(name, slug)";

export const priceRangeLabels: Record<string, string> = {
  budget: "اقتصادي",
  mid: "متوسط",
  premium: "مرتفع",
};

export const serviceModeLabels: Record<string, string> = {
  delivery: "توصيل",
  pickup: "استلام",
  onsite: "خدمة بالموقع",
};

export const languageLabels: Record<string, string> = {
  ar: "العربية",
  en: "الإنكليزية",
  tr: "التركية",
};

export const paymentMethodLabels: Record<string, string> = {
  cash: "نقداً",
  transfer: "تحويل",
  card: "بطاقة",
};

const fallbackBusinessCovers: Record<string, string> = {
  "abu-ahmad-welding": "/images/seed/welding-cover.svg",
  "al-hamra-paints": "/images/seed/construction-cover.svg",
  "al-kamal-auto-workshop": "/images/seed/auto-cover.svg",
  "al-sham-car-painting": "/images/seed/auto-cover.svg",
  "elite-auto-service": "/images/seed/auto-cover.svg",
  "fine-art-furniture": "/images/seed/furniture-cover.svg",
  "ibdaa-carpentry": "/images/seed/carpentry-cover.svg",
  "modern-construction-supply": "/images/seed/construction-cover.svg",
};

export const fallbackHomeAds: HomeAd[] = [
  {
    id: "fallback-hero-ad",
    title: "ورشة الأمان",
    description: "تصليح السيارات - خصم 20%",
    image_url: "/images/hero-ad.png",
    link_url: "/categories/cars",
  },
  {
    id: "fallback-furniture-ad",
    title: "معرض الإبداع",
    description: "أرقى أنواع المفروشات",
    image_url: "/images/ad-1.png",
    link_url: "/categories/furniture",
  },
  {
    id: "fallback-paints-ad",
    title: "دهانات المتحدة",
    description: "جودة تدوم",
    image_url: "/images/ad-2.png",
    link_url: "/categories/paints",
  },
  {
    id: "fallback-steel-ad",
    title: "الحديد أساس البناء",
    description: "لكل احتياجات البناء والتشييد",
    image_url: "/images/ad-3.png",
    link_url: "/categories/home-foundations",
  },
];

export const fallbackHomeHero: HomeHeroSettings = {
  image_url: "/images/hero-image.png",
  alt_text: "خدمات صناعية في حمص",
};

export const fallbackCategories: CategorySummary[] = [
  { id: "fallback-cars", name: "سيارات", slug: "cars", description: "صيانة وقطع سيارات", icon_name: "car", image_url: null },
  { id: "fallback-trucks", name: "شاحنات", slug: "trucks", description: "خدمات الشاحنات والنقل", icon_name: "truck", image_url: null },
  { id: "fallback-home", name: "أساس بيت", slug: "home-foundations", description: "مواد بناء وتجهيزات", icon_name: "house", image_url: null },
  { id: "fallback-furniture", name: "موبيليا", slug: "furniture", description: "مفروشات وأثاث", icon_name: "sofa", image_url: null },
  { id: "fallback-parts", name: "قطع صناعية", slug: "industrial-parts", description: "قطع ومستلزمات صناعية", icon_name: "cog", image_url: null },
  { id: "fallback-welding", name: "حدادة ولحام", slug: "welding", description: "حدادة وتلحيم معادن", icon_name: "wrench", image_url: null },
  { id: "fallback-carpentry", name: "نجارين", slug: "carpentry", description: "نجارة ومطابخ", icon_name: "ruler", image_url: null },
  { id: "fallback-renovation", name: "تجديد", slug: "renovation", description: "ترميم وتجديد", icon_name: "armchair", image_url: null },
  { id: "fallback-more", name: "المزيد", slug: "more", description: "فئات إضافية", icon_name: "ellipsis", image_url: null },
];

export const fallbackBusinesses: BusinessSummary[] = [
  {
    id: "fallback-business-1",
    name: "ورشة الكمال",
    slug: "al-kamal-auto-workshop",
    description: "ميكانيك وكهرباء سيارات مع تبديل زيوت وفحص أعطال.",
    phone: "0933 123 456",
    whatsapp_phone: "+963933123456",
    address: "حمص - الغوطة",
    area: "الغوطة",
    latitude: 34.7324,
    longitude: 36.7137,
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_trusted: true,
    price_range: "mid",
    service_modes: ["onsite"],
    languages: ["ar"],
    payment_methods: ["cash"],
    years_experience: 12,
    owner_bio: null,
    team_info: null,
    brochure_url: null,
    rating_average: 4.6,
    reviews_count: 18,
    cover_image_url: "/images/seed/auto-cover.svg",
    logo_url: "/images/seed/industrial-logo.svg",
    category_id: "fallback-cars",
    subcategory_id: null,
    owner_id: null,
    category: { name: "سيارات", slug: "cars" },
    subcategory: { name: "ميكانيك سيارات", slug: "auto-mechanics" },
  },
  {
    id: "fallback-business-2",
    name: "نجارة الإبداع",
    slug: "ibdaa-carpentry",
    description: "تفصيل مطابخ وموبيليا حسب الطلب.",
    phone: "0944 234 567",
    whatsapp_phone: "+963944234567",
    address: "حمص - الزهراء",
    area: "الزهراء",
    latitude: 34.745,
    longitude: 36.724,
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_trusted: false,
    price_range: "premium",
    service_modes: ["pickup", "onsite"],
    languages: ["ar"],
    payment_methods: ["cash", "transfer"],
    years_experience: 8,
    owner_bio: null,
    team_info: null,
    brochure_url: null,
    rating_average: 4.8,
    reviews_count: 22,
    cover_image_url: "/images/seed/carpentry-cover.svg",
    logo_url: "/images/seed/industrial-logo.svg",
    category_id: "fallback-carpentry",
    subcategory_id: null,
    owner_id: null,
    category: { name: "نجارين", slug: "carpentry" },
    subcategory: { name: "مطابخ وموبيليا", slug: "kitchens-furniture" },
  },
  {
    id: "fallback-business-3",
    name: "دهانات الشام",
    slug: "al-sham-car-painting",
    description: "دهان سيارات وخلط ألوان صناعية.",
    phone: "0932 345 678",
    whatsapp_phone: "+963932345678",
    address: "حمص - البياضة",
    area: "البياضة",
    latitude: 34.74,
    longitude: 36.707,
    status: "approved",
    is_featured: false,
    is_verified: false,
    is_trusted: false,
    price_range: "mid",
    service_modes: ["pickup"],
    languages: ["ar"],
    payment_methods: ["cash"],
    years_experience: 6,
    owner_bio: null,
    team_info: null,
    brochure_url: null,
    rating_average: 4.7,
    reviews_count: 15,
    cover_image_url: "/images/seed/auto-cover.svg",
    logo_url: "/images/seed/industrial-logo.svg",
    category_id: "fallback-paints",
    subcategory_id: null,
    owner_id: null,
    category: { name: "دهانات", slug: "paints" },
    subcategory: { name: "دهان سيارات", slug: "car-painting" },
  },
  {
    id: "fallback-business-4",
    name: "حدادة أبو أحمد",
    slug: "abu-ahmad-welding",
    description: "قص وتشكيل المعادن وأعمال لحام.",
    phone: "0935 456 789",
    whatsapp_phone: "+963935456789",
    address: "حمص - بابا عمرو",
    area: "بابا عمرو",
    latitude: 34.714,
    longitude: 36.68,
    status: "approved",
    is_featured: true,
    is_verified: false,
    is_trusted: true,
    price_range: "budget",
    service_modes: ["onsite"],
    languages: ["ar"],
    payment_methods: ["cash"],
    years_experience: 15,
    owner_bio: null,
    team_info: null,
    brochure_url: null,
    rating_average: 4.5,
    reviews_count: 11,
    cover_image_url: "/images/seed/welding-cover.svg",
    logo_url: "/images/seed/industrial-logo.svg",
    category_id: "fallback-welding",
    subcategory_id: null,
    owner_id: null,
    category: { name: "حدادة ولحام", slug: "welding" },
    subcategory: { name: "لحام معادن", slug: "metal-welding" },
  },
];

export function firstRelation<T>(relation: T[] | T | null): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

export function normalizeBusinesses(rows: unknown): BusinessSummary[] {
  return ((rows ?? []) as BusinessRow[]).map((row) => ({
    ...row,
    cover_image_url: row.cover_image_url ?? fallbackBusinessCovers[row.slug] ?? "/images/seed/welding-cover.svg",
    logo_url: row.logo_url ?? "/images/seed/industrial-logo.svg",
    category: firstRelation(row.category),
    subcategory: firstRelation(row.subcategory),
  }));
}

export function formatRating(value: number | string | null | undefined) {
  return Number(value ?? 0).toFixed(1);
}

export function formatDistance(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const distance = Number(value);
  if (!Number.isFinite(distance)) return null;
  return distance < 1 ? `${Math.round(distance * 1000)} م` : `${distance.toFixed(1)} كم`;
}

export function slugifyArabic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function getActiveCategories(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon_name, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as CategorySummary[];
}

export async function getActiveAreas(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("areas")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  return (data ?? []) as AreaSummary[];
}
