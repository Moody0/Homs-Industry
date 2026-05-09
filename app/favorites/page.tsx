import { removeFavoriteAction } from "@/actions/favorites";
import { BusinessCard } from "@/components/business/business-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { businessListSelect, normalizeBusinesses } from "@/lib/data/marketplace";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type FavoriteRow = {
  business: unknown[] | unknown | null;
  business_id: string;
};

export default async function FavoritesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(`business_id, business:businesses(${businessListSelect})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as FavoriteRow[];
  const businesses = normalizeBusinesses(
    rows.map((row) => (Array.isArray(row.business) ? row.business[0] : row.business)).filter(Boolean),
  );

  return (
    <Container className="py-10">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-black text-orange-600">المفضلة</p>
        <h1 className="text-3xl font-black text-slate-950">محلاتك المفضلة</h1>
      </div>
      {businesses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <div className="space-y-2" key={business.id}>
              <BusinessCard business={business} />
              <form action={removeFavoriteAction}>
                <input name="businessId" type="hidden" value={business.id} />
                <button className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700" type="submit">إزالة من المفضلة</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState action={<ButtonLink href="/categories">استعرض الفئات</ButtonLink>} description="لم تضف أي محل إلى المفضلة بعد." title="لا توجد مفضلة" />
      )}
    </Container>
  );
}
