import { Grid2X2 } from "lucide-react";
import { CategoryCard } from "@/components/home/category-card";
import { Container } from "@/components/ui/container";
import type { CategorySummary } from "@/lib/data/marketplace";

export function CategoriesRow({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="py-7 md:py-8">
      <Container>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950"><Grid2X2 aria-hidden className="size-5 text-orange-500" /> الفئات الرئيسية</h2>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-9 [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => <CategoryCard category={category} key={category.id} />)}
        </div>
      </Container>
    </section>
  );
}
