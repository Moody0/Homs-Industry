import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle2, Factory, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  footerText,
  footerHref,
  footerLinkText,
  children,
}: AuthShellProps) {
  return (
    <section className="bg-slate-50">
      <Container className="grid min-h-[calc(100vh-4rem)] place-items-center py-5 pb-24 sm:py-8 md:min-h-[calc(100vh-5rem)] lg:py-10">
        <Card className="grid w-full max-w-6xl overflow-hidden border-slate-200 shadow-xl shadow-slate-950/10 lg:grid-cols-[1fr_460px]">
          <div className="relative order-2 hidden min-h-[680px] overflow-hidden bg-[#071018] p-8 text-white lg:block">
            <Image
              alt="خدمات صناعية في حمص"
              className="object-cover opacity-30"
              fill
              priority
              sizes="460px"
              src="/images/hero-image.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,24,0.52),rgba(7,16,24,0.96))]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="inline-flex items-center gap-3 text-2xl font-black">
                <span className="grid size-12 place-items-center rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-950/30">
                  <Factory aria-hidden className="size-7" />
                </span>
                صنعة <span className="text-orange-400">حمص</span>
              </div>

              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white/80">
                  <Sparkles aria-hidden className="size-4 text-orange-300" />
                  دليل محلي للخدمات والمحلات
                </span>
                <h2 className="text-4xl font-black leading-tight">
                  حساب واحد للوصول إلى المحلات، المفضلة، ولوحة عملك.
                </h2>
                <div className="grid gap-3 text-sm font-bold text-white/78">
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                    <ShieldCheck aria-hidden className="size-5 shrink-0 text-orange-300" />
                    بياناتك محفوظة وتستخدم لتجربة أوضح داخل الدليل.
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                    <MapPin aria-hidden className="size-5 shrink-0 text-orange-300" />
                    اكتشف الخدمات الأقرب واحفظ ما يناسبك بسرعة.
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                    <CheckCircle2 aria-hidden className="size-5 shrink-0 text-orange-300" />
                    أضف عملك وتابع بياناته من لوحة تحكم مخصصة.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/10 p-3 text-center">
                <div>
                  <p className="text-xl font-black">حمص</p>
                  <p className="mt-1 text-[11px] font-bold text-white/55">النطاق</p>
                </div>
                <div>
                  <p className="text-xl font-black">موثوق</p>
                  <p className="mt-1 text-[11px] font-bold text-white/55">تجربة</p>
                </div>
                <div>
                  <p className="text-xl font-black">سريع</p>
                  <p className="mt-1 text-[11px] font-bold text-white/55">وصول</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="order-1 p-0">
            <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-7 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-orange-500 text-white">
                  <Factory aria-hidden className="size-6" />
                </span>
                <div>
                  <p className="text-lg font-black text-slate-950">صنعة حمص</p>
                  <p className="text-xs font-bold text-slate-500">دليل الخدمات والمحلات المحلية</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 md:p-8 lg:p-10">
              <div className="mb-6 space-y-2 sm:mb-7">
                <p className="text-xs font-black text-orange-600">مرحباً بك</p>
                <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{title}</h1>
                <p className="max-w-xl text-sm leading-7 text-slate-600">{description}</p>
              </div>
              {children}
              <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                {footerText}{" "}
                <Link className="font-black text-orange-600 hover:text-orange-700" href={footerHref}>
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
