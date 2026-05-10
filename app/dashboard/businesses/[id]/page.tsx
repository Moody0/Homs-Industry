import { notFound } from "next/navigation";
import { replyToReviewAction, updateOwnerBusinessAction, updateOwnerCatalogAction, updateOwnerHoursAction, updateOwnerTrustAction } from "@/actions/dashboard";
import { DashboardActionForm, DashboardSubmitButton } from "@/components/dashboard/dashboard-action-form";
import { RatingStars } from "@/components/business/rating-stars";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { languageLabels, paymentMethodLabels, priceRangeLabels, serviceModeLabels } from "@/lib/data/marketplace";

type PageProps = {
  params: Promise<{ id: string }>;
};

type BusinessHour = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp_phone: string | null;
  address: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  price_range: string | null;
  service_modes: string[];
  languages: string[];
  payment_methods: string[];
  years_experience: number | null;
  owner_bio: string | null;
  team_info: string | null;
  brochure_url: string | null;
  rating_average: number | string;
  reviews_count: number;
  status: string;
};

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const inputClass = "h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-500";
const textareaClass = "min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500";

function hasValue(values: string[] | null | undefined, value: string) {
  return Boolean(values?.includes(value));
}

function lineJoin<T>(rows: T[], build: (row: T) => string) {
  return rows.map(build).filter(Boolean).join("\n");
}

export default async function OwnerBusinessPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, description, phone, whatsapp_phone, address, area, latitude, longitude, price_range, service_modes, languages, payment_methods, years_experience, owner_bio, team_info, brochure_url, rating_average, reviews_count, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) notFound();

  const [
    hoursResult,
    servicesResult,
    productsResult,
    imagesResult,
    certificatesResult,
    projectsResult,
    reviewsResult,
    repliesResult,
    analyticsResult,
  ] = await Promise.all([
    supabase.from("business_hours").select("day_of_week, opens_at, closes_at, is_closed").eq("business_id", id).order("day_of_week"),
    supabase.from("business_services").select("name, description, sort_order").eq("business_id", id).order("sort_order"),
    supabase.from("business_products").select("name, price, description, sort_order").eq("business_id", id).order("sort_order"),
    supabase.from("business_images").select("image_url, alt_text, sort_order").eq("business_id", id).order("sort_order"),
    supabase.from("business_certificates").select("id, title, description, file_url, status").eq("business_id", id).order("created_at", { ascending: false }),
    supabase.from("business_project_images").select("title, before_image_url, after_image_url, description, sort_order").eq("business_id", id).order("sort_order"),
    supabase.from("reviews").select("id, rating, quality_rating, service_rating, value_rating, comment, created_at").eq("business_id", id).eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("review_replies").select("review_id, reply").eq("business_id", id),
    supabase.from("business_analytics_daily").select("event_date, views, call_clicks, whatsapp_clicks, direction_clicks, profile_clicks, inquiries").eq("business_id", id).order("event_date", { ascending: false }).limit(30),
  ]);

  const typedBusiness = business as BusinessRow;
  const hours = (hoursResult.data ?? []) as BusinessHour[];
  const hoursByDay = new Map(hours.map((hour) => [hour.day_of_week, hour]));
  const replies = new Map((repliesResult.data ?? []).map((reply) => [reply.review_id, reply.reply]));
  const analyticsTotals = (analyticsResult.data ?? []).reduce(
    (acc, row) => ({
      clicks: acc.clicks + Number(row.call_clicks ?? 0) + Number(row.whatsapp_clicks ?? 0) + Number(row.direction_clicks ?? 0) + Number(row.profile_clicks ?? 0),
      inquiries: acc.inquiries + Number(row.inquiries ?? 0),
      views: acc.views + Number(row.views ?? 0),
    }),
    { clicks: 0, inquiries: 0, views: 0 },
  );

  const serviceLines = lineJoin(servicesResult.data ?? [], (service) => `${service.name}${service.description ? ` | ${service.description}` : ""}`);
  const productLines = lineJoin(productsResult.data ?? [], (product) => `${product.name}${product.price ? ` | ${product.price}` : " | "}${product.description ? ` | ${product.description}` : ""}`);
  const imageLines = lineJoin(imagesResult.data ?? [], (image) => `${image.image_url}${image.alt_text ? ` | ${image.alt_text}` : ""}`);
  const certificateLines = lineJoin(certificatesResult.data ?? [], (certificate) => `${certificate.title} | ${certificate.file_url}${certificate.description ? ` | ${certificate.description}` : ""}`);
  const projectLines = lineJoin(projectsResult.data ?? [], (project) => `${project.title ?? ""} | ${project.before_image_url ?? ""} | ${project.after_image_url ?? ""}${project.description ? ` | ${project.description}` : ""}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-950">{typedBusiness.name}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            الحالة: {typedBusiness.status} · {Number(typedBusiness.rating_average).toFixed(1)} / 5 · {typedBusiness.reviews_count} تقييم
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/businesses/${typedBusiness.slug}`} variant="outline">عرض الصفحة</ButtonLink>
          <ButtonLink href="/dashboard" variant="ghost">رجوع</ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent><p className="text-2xl font-black">{analyticsTotals.views}</p><p className="text-xs font-bold text-slate-500">مشاهدات آخر 30 يوم</p></CardContent></Card>
        <Card><CardContent><p className="text-2xl font-black">{analyticsTotals.clicks}</p><p className="text-xs font-bold text-slate-500">نقرات وتفاعل</p></CardContent></Card>
        <Card><CardContent><p className="text-2xl font-black">{analyticsTotals.inquiries}</p><p className="text-xs font-bold text-slate-500">استفسارات</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><h2 className="text-xl font-black">بيانات المحل والصفحة المصغرة</h2></CardHeader>
        <CardContent>
          <DashboardActionForm action={updateOwnerBusinessAction} className="grid gap-4">
            <input name="businessId" type="hidden" value={typedBusiness.id} />
            <input name="slug" type="hidden" value={typedBusiness.slug} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} name="name" defaultValue={typedBusiness.name} placeholder="اسم المحل" required />
              <input className={inputClass} name="phone" defaultValue={typedBusiness.phone} placeholder="الهاتف" required />
              <input className={inputClass} name="whatsappPhone" defaultValue={typedBusiness.whatsapp_phone ?? ""} placeholder="واتساب" />
              <input className={inputClass} name="area" defaultValue={typedBusiness.area} placeholder="المنطقة" required />
              <input className={inputClass} name="address" defaultValue={typedBusiness.address} placeholder="العنوان" required />
              <input className={inputClass} name="yearsExperience" defaultValue={typedBusiness.years_experience ?? ""} placeholder="سنوات الخبرة" type="number" min="0" />
              <input className={inputClass} name="latitude" defaultValue={typedBusiness.latitude ?? ""} placeholder="خط العرض" />
              <input className={inputClass} name="longitude" defaultValue={typedBusiness.longitude ?? ""} placeholder="خط الطول" />
            </div>
            <textarea className={textareaClass} name="description" defaultValue={typedBusiness.description ?? ""} placeholder="وصف المحل" />
            <div className="grid gap-3 md:grid-cols-2">
              <textarea className={textareaClass} name="ownerBio" defaultValue={typedBusiness.owner_bio ?? ""} placeholder="نبذة عن صاحب المحل" />
              <textarea className={textareaClass} name="teamInfo" defaultValue={typedBusiness.team_info ?? ""} placeholder="معلومات الفريق" />
            </div>
            <input className={inputClass} name="brochureUrl" defaultValue={typedBusiness.brochure_url ?? ""} placeholder="رابط بروشور أو قائمة أسعار" />
            <div className="grid gap-3 md:grid-cols-4">
              <select className={inputClass} name="priceRange" defaultValue={typedBusiness.price_range ?? ""}>
                <option value="">بدون نطاق سعر</option>
                {Object.entries(priceRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <fieldset className="rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-xs font-black text-slate-600">نوع الخدمة</legend>
                {Object.entries(serviceModeLabels).map(([value, label]) => <label className="mt-2 flex items-center gap-2 text-sm" key={value}><input name="serviceModes" type="checkbox" value={value} defaultChecked={hasValue(typedBusiness.service_modes, value)} />{label}</label>)}
              </fieldset>
              <fieldset className="rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-xs font-black text-slate-600">اللغات</legend>
                {Object.entries(languageLabels).map(([value, label]) => <label className="mt-2 flex items-center gap-2 text-sm" key={value}><input name="languages" type="checkbox" value={value} defaultChecked={hasValue(typedBusiness.languages, value)} />{label}</label>)}
              </fieldset>
              <fieldset className="rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-xs font-black text-slate-600">الدفع</legend>
                {Object.entries(paymentMethodLabels).map(([value, label]) => <label className="mt-2 flex items-center gap-2 text-sm" key={value}><input name="paymentMethods" type="checkbox" value={value} defaultChecked={hasValue(typedBusiness.payment_methods, value)} />{label}</label>)}
              </fieldset>
            </div>
            <DashboardSubmitButton>حفظ البيانات</DashboardSubmitButton>
          </DashboardActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="text-xl font-black">ساعات العمل</h2></CardHeader>
        <CardContent>
          <DashboardActionForm action={updateOwnerHoursAction} className="grid gap-4">
            <input name="businessId" type="hidden" value={typedBusiness.id} />
            <div className="grid gap-3 md:grid-cols-2">
              {dayNames.map((day, index) => {
                const hour = hoursByDay.get(index);
                return (
                  <div className="grid gap-2 rounded-lg border border-slate-200 p-3" key={day}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black">{day}</span>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input name={`closed_${index}`} type="checkbox" defaultChecked={hour?.is_closed ?? false} />مغلق</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} name={`opens_${index}`} type="time" defaultValue={hour?.opens_at?.slice(0, 5) ?? "09:00"} />
                      <input className={inputClass} name={`closes_${index}`} type="time" defaultValue={hour?.closes_at?.slice(0, 5) ?? "18:00"} />
                    </div>
                  </div>
                );
              })}
            </div>
            <DashboardSubmitButton>حفظ ساعات العمل</DashboardSubmitButton>
          </DashboardActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="text-xl font-black">الخدمات والمنتجات والمعرض</h2></CardHeader>
        <CardContent>
          <DashboardActionForm action={updateOwnerCatalogAction} className="grid gap-4">
            <input name="businessId" type="hidden" value={typedBusiness.id} />
            <textarea className={textareaClass} name="services" defaultValue={serviceLines} placeholder="كل خدمة بسطر: اسم الخدمة | وصف اختياري" />
            <textarea className={textareaClass} name="products" defaultValue={productLines} placeholder="كل منتج بسطر: اسم المنتج | السعر | وصف اختياري" />
            <textarea className={textareaClass} name="images" defaultValue={imageLines} placeholder="كل صورة بسطر: رابط الصورة | وصف اختياري. الصورة الأولى تصبح الغلاف." />
            <DashboardSubmitButton>حفظ المحتوى</DashboardSubmitButton>
          </DashboardActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="text-xl font-black">الثقة والمشاريع</h2></CardHeader>
        <CardContent>
          <DashboardActionForm action={updateOwnerTrustAction} className="grid gap-4">
            <input name="businessId" type="hidden" value={typedBusiness.id} />
            <textarea className={textareaClass} name="certificates" defaultValue={certificateLines} placeholder="كل شهادة بسطر: العنوان | رابط الصورة/الملف | وصف اختياري" />
            <textarea className={textareaClass} name="projects" defaultValue={projectLines} placeholder="كل مشروع بسطر: العنوان | صورة قبل | صورة بعد | وصف اختياري" />
            <DashboardSubmitButton>حفظ ملفات الثقة</DashboardSubmitButton>
          </DashboardActionForm>
          {certificatesResult.data?.length ? (
            <div className="mt-4 grid gap-2">
              {certificatesResult.data.map((certificate) => <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700" key={certificate.id}>{certificate.title}: {certificate.status}</p>)}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card id="reviews">
        <CardHeader><h2 className="text-xl font-black">التقييمات والردود</h2></CardHeader>
        <CardContent className="grid gap-4">
          {(reviewsResult.data ?? []).length ? (reviewsResult.data ?? []).map((review) => (
            <div className="rounded-lg border border-slate-200 p-4" key={review.id}>
              <RatingStars rating={review.rating} />
              <p className="mt-2 text-sm leading-7 text-slate-700">{review.comment || "بدون تعليق"}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("ar-SY")}</p>
              <DashboardActionForm action={replyToReviewAction} className="mt-3 grid gap-2">
                <input name="businessId" type="hidden" value={typedBusiness.id} />
                <input name="reviewId" type="hidden" value={review.id} />
                <textarea className={textareaClass} name="reply" defaultValue={replies.get(review.id) ?? ""} placeholder="رد صاحب المحل" />
                <DashboardSubmitButton>حفظ الرد</DashboardSubmitButton>
              </DashboardActionForm>
            </div>
          )) : <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">لا توجد تقييمات بعد.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
