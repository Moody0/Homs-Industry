import { Grid2X2, Search } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { getActiveCategories } from "@/lib/data/marketplace";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const categories = await getActiveCategories(supabase);

  return (
    <Container className="py-10">
      <section className="mb-8 overflow-hidden rounded-lg bg-[#071018] p-6 text-white md:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 text-sm font-black text-orange-400">
            <Grid2X2 aria-hidden className="size-5" />
            الفئات الصناعية
          </p>
          <h1 className="text-3xl font-black md:text-4xl">استعرض خدمات حمص حسب الفئة</h1>
          <form action="/search" className="grid max-w-2xl overflow-hidden rounded-lg bg-white text-slate-950 md:grid-cols-[1fr_56px]">
            <input className="h-12 bg-transparent px-4 text-sm outline-none" name="q" placeholder="ابحث عن فئة أو خدمة" />
            <button className="grid h-12 place-items-center bg-orange-500 text-white" type="submit">
              <Search aria-hidden className="size-5" />
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md" href={`/categories/${category.slug}`} key={category.id}>
            <div className="mb-4 grid size-12 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <Grid2X2 aria-hidden className="size-6" />
            </div>
            <h2 className="text-xl font-black text-slate-950 group-hover:text-orange-600">{category.name}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{category.description ?? "خدمات ومحلات موثوقة ضمن هذه الفئة."}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
