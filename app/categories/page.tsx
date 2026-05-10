import { ArrowLeft, Grid2X2, Search } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/home/category-card";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { getActiveCategories } from "@/lib/data/marketplace";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const categories = await getActiveCategories(supabase);

  return (
    <Container className="pb-24 pt-5 sm:py-10">
      <section className="mb-6 overflow-hidden rounded-lg bg-[#071018] p-5 text-white shadow-sm sm:p-6 md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_220px] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-black text-orange-400">
              <Grid2X2 aria-hidden className="size-5" />
              الفئات الصناعية
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">استعرض خدمات حمص حسب الفئة</h1>
            <p className="mt-2 text-sm leading-7 text-white/70">ابدأ من الفئة المناسبة ثم انتقل إلى المحلات والخدمات الأقرب لاحتياجك.</p>
            <form action="/search" className="mt-5 grid max-w-2xl overflow-hidden rounded-lg bg-white text-slate-950 shadow-lg shadow-black/15 sm:grid-cols-[1fr_56px]">
              <input className="h-12 bg-transparent px-4 text-sm outline-none" name="q" placeholder="ابحث عن فئة أو خدمة" />
              <button className="grid h-12 place-items-center bg-orange-500 text-white" type="submit">
                <Search aria-hidden className="size-5" />
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div>
              <p className="text-2xl font-black text-white">{categories.length}</p>
              <p className="text-[11px] font-bold text-white/60">فئة</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">حمص</p>
              <p className="text-[11px] font-bold text-white/60">نطاق الدليل</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 flex snap-x gap-3 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Link className="flex min-w-28 snap-start flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm" href={`/categories/${category.slug}`} key={category.id}>
            <CategoryIcon aria-hidden className="size-7 text-orange-500" iconName={category.icon_name} strokeWidth={1.8} />
            <span className="line-clamp-2 text-xs font-black text-slate-800">{category.name}</span>
          </Link>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-950">كل الفئات</h2>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{categories.length} فئة</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link className="group grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:block sm:p-5" href={`/categories/${category.slug}`} key={category.id}>
            <div className="grid size-12 place-items-center rounded-lg bg-orange-50 text-orange-600 sm:mb-4">
              <CategoryIcon aria-hidden className="size-7 text-orange-500 sm:size-8" iconName={category.icon_name} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="line-clamp-1 text-base font-black text-slate-950 group-hover:text-orange-600 sm:text-xl">{category.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-600 sm:mt-2 sm:text-sm sm:leading-7">{category.description ?? "خدمات ومحلات موثوقة ضمن هذه الفئة."}</p>
            </div>
            <ArrowLeft aria-hidden className="size-5 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500 sm:hidden" />
          </Link>
        ))}
      </div>
    </Container>
  );
}
