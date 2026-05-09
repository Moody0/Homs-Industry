import { Grid2X2 } from "lucide-react";
import { CategoryCard } from "@/components/home/category-card";
import { Container } from "@/components/ui/container";
import type { CategorySummary } from "@/lib/data/marketplace";

export function CategoriesRow({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="py-8">
      <Container>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950"><Grid2X2 aria-hidden className="size-5 text-orange-500" /> الفئات الرئيسية</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-9">
          {categories.map((category) => <CategoryCard category={category} key={category.id} />)}
        </div>
      </Container>
    </section>
  );
}
