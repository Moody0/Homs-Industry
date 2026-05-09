import { AddBusinessForm } from "@/components/forms/add-business-form";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { getActiveAreas, getActiveCategories } from "@/lib/data/marketplace";

export default async function AddBusinessPage() {
  await requireUser();
  const supabase = await createClient();
  const [areas, categories, subcategoriesResult] = await Promise.all([
    getActiveAreas(supabase),
    getActiveCategories(supabase),
    supabase
      .from("subcategories")
      .select("id, name, slug, category_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <Container className="py-10">
      <div className="mb-6 max-w-3xl space-y-2">
        <p className="text-sm font-black text-orange-600">إضافة محل</p>
        <h1 className="text-3xl font-black text-slate-950">أرسل طلب إضافة محلك</h1>
        <p className="text-sm leading-7 text-slate-600">
          سيتم حفظ الطلب بحالة معلقة، وبعد المراجعة يظهر للزوار ضمن الدليل.
        </p>
      </div>
      <AddBusinessForm
        areas={areas}
        categories={categories}
        subcategories={(subcategoriesResult.data ?? []) as never}
      />
    </Container>
  );
}
