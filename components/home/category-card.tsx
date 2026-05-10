import Link from "next/link";
import { Armchair, Car, Cog, Ellipsis, Factory, Hammer, House, Ruler, Sofa, Truck } from "lucide-react";
import type { ComponentProps } from "react";
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

type CategoryIconProps = ComponentProps<typeof Factory> & {
  iconName?: string | null;
};

export function CategoryIcon({ iconName, ...props }: CategoryIconProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap] ?? Factory;
  return <Icon {...props} />;
}

export function CategoryCard({ category }: { category: Pick<CategorySummary, "name" | "slug" | "icon_name"> }) {
  return (
    <Link
      className="group grid h-[88px] min-w-[86px] shrink-0 snap-start place-items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md md:h-auto md:min-h-24 md:min-w-0 md:p-4"
      href={`/categories/${category.slug}`}
    >
      <CategoryIcon aria-hidden className="size-7 text-orange-500 md:size-9" iconName={category.icon_name} strokeWidth={1.8} />
      <span className="line-clamp-2 text-xs font-black leading-5 text-slate-800 group-hover:text-orange-600 md:text-sm">{category.name}</span>
    </Link>
  );
}
