import Image from "next/image";
import { updateHomeHeroAction } from "@/actions/admin";
import { AdminActionForm, AdminSubmitButton } from "@/components/admin/admin-action-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { fallbackHomeHero, type HomeHeroSettings } from "@/lib/data/marketplace";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "home_hero")
    .maybeSingle();

  const heroValue = data?.value as Partial<HomeHeroSettings> | null | undefined;
  const hero = heroValue?.image_url ? { ...fallbackHomeHero, ...heroValue } : fallbackHomeHero;

  return (
    <>
      <AdminHeader
        description="عدّل العناصر العامة للواجهة مثل صورة الهيرو الرئيسية. ستظهر التغييرات في الصفحة الرئيسية بعد الحفظ."
        title="إعدادات الموقع"
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">صورة الهيرو الرئيسية</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          ارفع صورة جديدة أو ضع رابط صورة خارجي. يفضّل استخدام صورة صناعية أفقية واضحة.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="relative h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            <Image
              alt={hero.alt_text ?? "صورة الهيرو الرئيسية"}
              className="object-cover"
              fill
              sizes="320px"
              src={hero.image_url}
            />
          </div>

          <AdminActionForm action={updateHomeHeroAction} className="grid gap-3" encType="multipart/form-data">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">رابط الصورة الحالي أو الخارجي</span>
              <input
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                dir="ltr"
                name="existingImageUrl"
                defaultValue={hero.image_url}
                placeholder="/images/hero-image.png أو https://..."
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">وصف الصورة</span>
              <input
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                name="altText"
                defaultValue={hero.alt_text ?? ""}
                placeholder="خدمات صناعية في حمص"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">رفع صورة جديدة</span>
              <input accept="image/*" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="image" type="file" />
            </label>
            <AdminSubmitButton className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-70">
              حفظ إعدادات الهيرو
            </AdminSubmitButton>
          </AdminActionForm>
        </div>
      </section>
    </>
  );
}
