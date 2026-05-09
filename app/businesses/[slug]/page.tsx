import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { BusinessGallery } from "@/components/business/business-gallery";
import { BusinessHeader } from "@/components/business/business-header";
import { ContactButtons } from "@/components/business/contact-buttons";
import { RatingStars } from "@/components/business/rating-stars";
import { ReviewForm } from "@/components/business/review-form";
import { StickyContactBar } from "@/components/business/sticky-contact-bar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { businessListSelect, normalizeBusinesses } from "@/lib/data/marketplace";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type BusinessPageProps = {
  params: Promise<{ slug: string }>;
};

type BusinessHour = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function currentOpenState(hours: BusinessHour[]) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = hours.find((hour) => hour.day_of_week === currentDay);

  if (!today || today.is_closed || !today.opens_at || !today.closes_at) {
    return { label: "مغلق الآن", tone: "closed" as const };
  }

  const opensAt = today.opens_at.slice(0, 5);
  const closesAt = today.closes_at.slice(0, 5);
  const isOpen = currentTime >= opensAt && currentTime <= closesAt;

  return { label: isOpen ? "مفتوح الآن" : "مغلق الآن", tone: isOpen ? "open" as const : "closed" as const };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const { data: businessRow } = await supabase
    .from("businesses")
    .select(businessListSelect)
    .eq("slug", slug)
    .single();

  const business = normalizeBusinesses(businessRow ? [businessRow] : [])[0];

  if (!business) notFound();

  const canViewPending =
    business.status === "approved" ||
    business.owner_id === user?.id ||
    profile?.role === "admin";

  if (!canViewPending) notFound();

  const [hoursResult, imagesResult, servicesResult, productsResult, reviewsResult, favoriteResult, reviewResult] =
    await Promise.all([
      supabase
        .from("business_hours")
        .select("day_of_week, opens_at, closes_at, is_closed")
        .eq("business_id", business.id)
        .order("day_of_week", { ascending: true }),
      supabase
        .from("business_images")
        .select("id, image_url, alt_text, sort_order")
        .eq("business_id", business.id)
        .order("sort_order", { ascending: true }),
      supabase.from("business_services").select("id, name, description").eq("business_id", business.id).order("sort_order"),
      supabase.from("business_products").select("id, name, description, price, image_url").eq("business_id", business.id).order("sort_order"),
      supabase.from("reviews").select("id, user_id, rating, comment, created_at").eq("business_id", business.id).eq("status", "approved").order("created_at", { ascending: false }),
      user ? supabase.from("favorites").select("business_id").eq("business_id", business.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from("reviews").select("rating, comment").eq("business_id", business.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);

  const hours = (hoursResult.data ?? []) as BusinessHour[];
  const images = imagesResult.data ?? [];
  const services = servicesResult.data ?? [];
  const products = productsResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const cover = business.cover_image_url || images[0]?.image_url;

  return (
    <>
      <BusinessHeader
        business={business}
        cover={cover}
        isAuthenticated={Boolean(user)}
        isFavorite={Boolean(favoriteResult.data)}
      />

      <Container className="grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="text-xl font-black">معلومات المحل</h2></CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-slate-700 md:grid-cols-2">
              <p><strong>الفئة:</strong> {business.category?.name}</p>
              <p><strong>الفئة الفرعية:</strong> {business.subcategory?.name ?? "غير محدد"}</p>
              <p><strong>المنطقة:</strong> {business.area}</p>
              <p><strong>العنوان:</strong> {business.address}</p>
            </CardContent>
          </Card>

          {hours.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black">ساعات العمل</h2>
                  {(() => {
                    const state = currentOpenState(hours);
                    return (
                      <span className={state.tone === "open" ? "rounded-md bg-green-50 px-3 py-1 text-xs font-black text-green-700" : "rounded-md bg-slate-100 px-3 py-1 text-xs font-black text-slate-700"}>
                        {state.label}
                      </span>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                {hours.map((hour) => (
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2" key={hour.day_of_week}>
                    <span className="font-bold">{dayNames[hour.day_of_week]}</span>
                    <span>{hour.is_closed ? "مغلق" : `${hour.opens_at?.slice(0, 5)} - ${hour.closes_at?.slice(0, 5)}`}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {services.length > 0 ? (
            <Card><CardHeader><h2 className="text-xl font-black">الخدمات</h2></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{services.map((service) => <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={service.id}><h3 className="font-black text-slate-950">{service.name}</h3><p className="mt-1 text-sm text-slate-600">{service.description}</p></div>)}</CardContent></Card>
          ) : null}

          {products.length > 0 ? (
            <Card><CardHeader><h2 className="text-xl font-black">المنتجات</h2></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{products.map((product) => <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={product.id}><h3 className="font-black text-slate-950">{product.name}</h3>{product.price ? <p className="text-sm font-bold text-orange-600">{product.price} ل.س</p> : null}<p className="mt-1 text-sm text-slate-600">{product.description}</p></div>)}</CardContent></Card>
          ) : null}

          <BusinessGallery fallbackAlt={business.name} images={images} />

          <Card>
            <CardHeader><h2 className="text-xl font-black">التقييمات</h2></CardHeader>
            <CardContent className="space-y-4">
              {user ? <ReviewForm businessId={business.id} existingComment={reviewResult.data?.comment ?? null} existingRating={reviewResult.data?.rating ?? 5} /> : <ButtonLink href="/login" variant="outline">سجل الدخول لإضافة تقييم</ButtonLink>}
              <div className="grid gap-3">
                {reviews.map((review) => <div className="rounded-lg border border-slate-100 p-3" key={review.id}><RatingStars rating={review.rating} /><p className="mt-2 text-sm leading-7 text-slate-700">{review.comment || "بدون تعليق"}</p><p className="mt-1 text-xs text-slate-400"><Clock3 className="inline size-3" /> {new Date(review.created_at).toLocaleDateString("ar-SY")}</p></div>)}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-black">تواصل مباشر</h2>
              <ContactButtons className="flex-col" phone={business.phone} whatsappPhone={business.whatsapp_phone} />
              {business.latitude && business.longitude ? (
                <iframe className="h-56 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude}&z=15&output=embed`} title={`موقع ${business.name}`} />
              ) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">لا توجد إحداثيات لهذا المحل حالياً.</p>}
            </CardContent>
          </Card>
        </aside>
      </Container>

      <StickyContactBar phone={business.phone} whatsappPhone={business.whatsapp_phone} />
    </>
  );
}
