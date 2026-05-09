import Link from "next/link";
import { Armchair, Car, Cog, Ellipsis, Factory, Hammer, House, Ruler, Sofa, Truck } from "lucide-react";
import type { CategorySummary } from "@/lib/data/marketplace";

const iconMap = {
  armchair: Armchair,
  car: Car,
  cog: Cog,
  ellipsis: Ellipsis,
  house: House,
  ruler: Ruler,
  sofa: Sofa,
  truck: Truck,
  wrench: Hammer,
} as const;

export function CategoryCard({ category }: { category: Pick<CategorySummary, "name" | "slug" | "icon_name"> }) {
  const Icon = iconMap[category.icon_name as keyof typeof iconMap] ?? Factory;

  return (
    <Link
      className="group grid min-h-24 place-items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
      href={`/categories/${category.slug}`}
    >
      <Icon aria-hidden className="size-9 text-orange-500" strokeWidth={1.8} />
      <span className="text-sm font-black text-slate-800 group-hover:text-orange-600">{category.name}</span>
    </Link>
  );
}
