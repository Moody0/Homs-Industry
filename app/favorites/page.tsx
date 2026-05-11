import { removeFavoriteAction } from "@/actions/favorites";
import { BusinessCard } from "@/components/business/business-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { businessListSelect, normalizeBusinesses } from "@/lib/data/marketplace";
import { dbQuery } from "@/lib/db/postgres";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function FavoritesPage() {
  const user = await requireUser();
  const favoriteResult = await dbQuery<{ business_id: string }>(
    "select business_id::text from public.favorites where user_id = $1::uuid order by created_at desc",
    [user.id],
  );
  const favoriteIds = favoriteResult.rows.map((row) => row.business_id);
  const supabase = await createClient();
  const { data } = favoriteIds.length
    ? await supabase.from("businesses").select(businessListSelect).in("id", favoriteIds)
    : { data: [] };
  const businesses = normalizeBusinesses(data).sort(
    (a, b) => favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id),
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
