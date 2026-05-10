import { notFound } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { Award, BriefcaseBusiness, Clock3, CreditCard, Download, Languages, MapPin, Receipt, ThumbsUp, TriangleAlert, UserRound, UsersRound } from "lucide-react";
import { reportReviewAction, toggleHelpfulReviewAction } from "@/actions/reviews";
import { AnalyticsLink } from "@/components/business/analytics-link";
import { BusinessViewTracker } from "@/components/business/analytics-event";
import { BusinessGallery } from "@/components/business/business-gallery";
import { BusinessHeader } from "@/components/business/business-header";
import { ContactButtons } from "@/components/business/contact-buttons";
import { RatingStars } from "@/components/business/rating-stars";
import { ReviewForm } from "@/components/business/review-form";
import { StickyContactBar } from "@/components/business/sticky-contact-bar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { businessListSelect, languageLabels, normalizeBusinesses, paymentMethodLabels, priceRangeLabels, serviceModeLabels } from "@/lib/data/marketplace";
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

function SectionTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-black text-orange-600">{eyebrow}</p> : null}
      <h2 className="text-xl font-black text-slate-950">{children}</h2>
    </div>
  );
}

function FactCard({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-orange-600 shadow-sm">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-500">{label}</p>
        <div className="mt-1 text-sm font-bold leading-6 text-slate-800">{value}</div>
      </div>
    </div>
  );
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

  const [hoursResult, imagesResult, servicesResult, productsResult, reviewsResult, favoriteResult, reviewResult, repliesResult, certificatesResult, projectsResult] =
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
      supabase.from("reviews").select("id, user_id, rating, quality_rating, service_rating, value_rating, comment, created_at").eq("business_id", business.id).eq("status", "approved").order("created_at", { ascending: false }),
      user ? supabase.from("favorites").select("business_id").eq("business_id", business.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from("reviews").select("rating, quality_rating, service_rating, value_rating, comment").eq("business_id", business.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("review_replies").select("review_id, reply, created_at").eq("business_id", business.id),
      supabase.from("business_certificates").select("id, title, description, file_url").eq("business_id", business.id).eq("status", "approved").order("created_at", { ascending: false }),
      supabase.from("business_project_images").select("id, title, before_image_url, after_image_url, description").eq("business_id", business.id).order("sort_order"),
    ]);

  const hours = (hoursResult.data ?? []) as BusinessHour[];
  const images = imagesResult.data ?? [];
  const services = servicesResult.data ?? [];
  const products = productsResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const reviewIds = reviews.map((review) => review.id);
  const { data: helpfulVotes } = reviewIds.length
    ? await supabase.from("review_helpful_votes").select("review_id, user_id").in("review_id", reviewIds)
    : { data: [] };
  const replies = new Map((repliesResult.data ?? []).map((reply) => [reply.review_id, reply]));
  const helpfulCounts = new Map<string, number>();
  const helpfulByUser = new Set<string>();
  for (const vote of helpfulVotes ?? []) {
    helpfulCounts.set(vote.review_id, (helpfulCounts.get(vote.review_id) ?? 0) + 1);
    if (user && vote.user_id === user.id) helpfulByUser.add(vote.review_id);
  }
  const certificates = certificatesResult.data ?? [];
  const projects = projectsResult.data ?? [];
  const cover = business.cover_image_url || images[0]?.image_url;
  const ratingBreakdown = [
    ["الجودة", reviews.map((review) => review.quality_rating).filter(Boolean)],
    ["الخدمة", reviews.map((review) => review.service_rating).filter(Boolean)],
    ["القيمة", reviews.map((review) => review.value_rating).filter(Boolean)],
  ].map(([label, values]) => {
    const numbers = values as number[];
    return {
      label,
      value: numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0,
    };
  });

  return (
    <>
      {business.status === "approved" ? <BusinessViewTracker businessId={business.id} /> : null}
      <BusinessHeader
        business={business}
        cover={cover}
        isAuthenticated={Boolean(user)}
        isFavorite={Boolean(favoriteResult.data)}
      />

      <Container className="grid gap-5 pb-28 pt-5 sm:py-8 lg:grid-cols-[1fr_340px] lg:gap-6">
        <div className="order-2 space-y-5 lg:order-1 lg:space-y-6">
          <Card>
            <CardHeader><SectionTitle eyebrow="نظرة سريعة">معلومات المحل</SectionTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <FactCard icon={BriefcaseBusiness} label="الفئة" value={business.subcategory?.name ?? business.category?.name ?? "خدمات صناعية"} />
              <FactCard icon={MapPin} label="الموقع" value={`حمص - ${business.area}`} />
              <FactCard icon={Receipt} label="العنوان" value={business.address} />
              {business.price_range ? <FactCard icon={CreditCard} label="نطاق السعر" value={priceRangeLabels[business.price_range] ?? business.price_range} /> : null}
              {business.years_experience !== null ? <FactCard icon={Award} label="سنوات الخبرة" value={`${business.years_experience} سنة`} /> : null}
              {business.service_modes.length ? <FactCard icon={BriefcaseBusiness} label="نوع الخدمة" value={business.service_modes.map((mode) => serviceModeLabels[mode] ?? mode).join("، ")} /> : null}
              {business.languages.length ? <FactCard icon={Languages} label="اللغات" value={business.languages.map((language) => languageLabels[language] ?? language).join("، ")} /> : null}
              {business.payment_methods.length ? <FactCard icon={CreditCard} label="طرق الدفع" value={business.payment_methods.map((method) => paymentMethodLabels[method] ?? method).join("، ")} /> : null}
              {business.brochure_url ? <FactCard icon={Download} label="قائمة الأسعار" value={<a className="font-black text-orange-600" href={business.brochure_url} rel="noreferrer" target="_blank">تحميل القائمة</a>} /> : null}
            </CardContent>
          </Card>

          {business.owner_bio || business.team_info ? (
            <Card>
              <CardHeader><SectionTitle eyebrow="من يعمل على طلبك">الفريق والخبرة</SectionTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {business.owner_bio ? <FactCard icon={UserRound} label="صاحب المحل" value={business.owner_bio} /> : null}
                {business.team_info ? <FactCard icon={UsersRound} label="الفريق" value={business.team_info} /> : null}
              </CardContent>
            </Card>
          ) : null}

          {hours.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionTitle eyebrow="مواعيد الزيارة">ساعات العمل</SectionTitle>
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
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-3" key={hour.day_of_week}>
                    <span className="font-bold">{dayNames[hour.day_of_week]}</span>
                    <span>{hour.is_closed ? "مغلق" : `${hour.opens_at?.slice(0, 5)} - ${hour.closes_at?.slice(0, 5)}`}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {services.length > 0 ? (
            <Card><CardHeader><SectionTitle eyebrow="ماذا يقدم؟">الخدمات</SectionTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{services.map((service) => <div className="rounded-lg border border-slate-100 bg-slate-50 p-4" key={service.id}><h3 className="font-black text-slate-950">{service.name}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{service.description}</p></div>)}</CardContent></Card>
          ) : null}

          {products.length > 0 ? (
            <Card><CardHeader><SectionTitle eyebrow="قائمة مختصرة">المنتجات</SectionTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{products.map((product) => <div className="rounded-lg border border-slate-100 bg-slate-50 p-4" key={product.id}><h3 className="font-black text-slate-950">{product.name}</h3>{product.price ? <p className="mt-1 text-sm font-black text-orange-600">{product.price} ل.س</p> : null}<p className="mt-1 text-sm leading-7 text-slate-600">{product.description}</p></div>)}</CardContent></Card>
          ) : null}

          <BusinessGallery fallbackAlt={business.name} images={images} />

          {projects.length > 0 ? (
            <Card>
              <CardHeader><SectionTitle eyebrow="أعمال منفذة">قبل وبعد</SectionTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" key={project.id}>
                    <h3 className="font-black text-slate-950">{project.title ?? "مشروع منفذ"}</h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {project.before_image_url ? <Image alt="قبل" className="h-40 w-full rounded-lg object-cover" height={160} src={project.before_image_url} width={320} /> : null}
                      {project.after_image_url ? <Image alt="بعد" className="h-40 w-full rounded-lg object-cover" height={160} src={project.after_image_url} width={320} /> : null}
                    </div>
                    {project.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{project.description}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {certificates.length > 0 ? (
            <Card>
              <CardHeader><SectionTitle eyebrow="إثباتات معتمدة">شهادات وتوثيق</SectionTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {certificates.map((certificate) => (
                  <a className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-bold text-green-800" href={certificate.file_url} key={certificate.id} rel="noreferrer" target="_blank">
                    <Award className="mb-2 size-5" />
                    {certificate.title}
                    {certificate.description ? <span className="mt-1 block font-semibold text-green-700">{certificate.description}</span> : null}
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><SectionTitle eyebrow={`${reviews.length} تقييم`}>التقييمات</SectionTitle></CardHeader>
            <CardContent className="space-y-4">
              {ratingBreakdown.some((item) => item.value > 0) ? (
                <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3">
                  {ratingBreakdown.map((item) => <p className="rounded-lg bg-white px-3 py-2 font-bold text-slate-700" key={String(item.label)}>{String(item.label)}: {item.value ? item.value.toFixed(1) : "لا يوجد"}</p>)}
                </div>
              ) : null}
              {user ? (
                <ReviewForm
                  businessId={business.id}
                  existingComment={reviewResult.data?.comment ?? null}
                  existingQualityRating={reviewResult.data?.quality_rating ?? null}
                  existingRating={reviewResult.data?.rating ?? 5}
                  existingServiceRating={reviewResult.data?.service_rating ?? null}
                  existingValueRating={reviewResult.data?.value_rating ?? null}
                />
              ) : <ButtonLink href="/login" variant="outline">سجل الدخول لإضافة تقييم</ButtonLink>}
              <div className="grid gap-3">
                {reviews.map((review) => {
                  const reply = replies.get(review.id);
                  return (
                    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm" key={review.id}>
                      <RatingStars rating={review.rating} />
                      <p className="mt-2 text-sm leading-7 text-slate-700">{review.comment || "بدون تعليق"}</p>
                      <p className="mt-1 text-xs text-slate-400"><Clock3 className="inline size-3" /> {new Date(review.created_at).toLocaleDateString("ar-SY")}</p>
                      {reply ? <div className="mt-3 rounded-lg bg-orange-50 p-3 text-sm leading-7 text-orange-900"><strong>رد صاحب المحل:</strong> {reply.reply}</div> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user ? (
                          <form action={toggleHelpfulReviewAction}>
                            <input name="reviewId" type="hidden" value={review.id} />
                            <input name="businessSlug" type="hidden" value={business.slug} />
                            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700" type="submit">
                              <ThumbsUp className="size-4" /> مفيد {helpfulCounts.get(review.id) ?? 0}{helpfulByUser.has(review.id) ? " ✓" : ""}
                            </button>
                          </form>
                        ) : <span className="text-xs font-bold text-slate-500">مفيد {helpfulCounts.get(review.id) ?? 0}</span>}
                        {user ? (
                          <form action={reportReviewAction} className="flex gap-2">
                            <input name="reviewId" type="hidden" value={review.id} />
                            <input name="businessSlug" type="hidden" value={business.slug} />
                            <input className="h-9 rounded-lg border border-slate-200 px-3 text-xs" name="reason" placeholder="سبب البلاغ" />
                            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-black text-red-700" type="submit"><TriangleAlert className="size-4" /> بلاغ</button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="order-1 space-y-5 lg:order-2 lg:space-y-6">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="space-y-4">
              <SectionTitle eyebrow="جاهز للتواصل">تواصل مباشر</SectionTitle>
              <ContactButtons businessId={business.id} className="flex-col" phone={business.phone} whatsappPhone={business.whatsapp_phone} />
              {business.latitude && business.longitude ? (
                <div className="grid gap-3">
                  <iframe className="h-56 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude}&z=15&output=embed`} title={`موقع ${business.name}`} />
                  <AnalyticsLink businessId={business.id} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-black text-slate-800" eventKind="directions" href={`https://maps.google.com/?q=${business.latitude},${business.longitude}`} rel="noreferrer" target="_blank">الاتجاهات</AnalyticsLink>
                </div>
              ) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">لا توجد إحداثيات لهذا المحل حالياً.</p>}
            </CardContent>
          </Card>
        </aside>
      </Container>

      <StickyContactBar businessId={business.id} phone={business.phone} whatsappPhone={business.whatsapp_phone} />
    </>
  );
}
