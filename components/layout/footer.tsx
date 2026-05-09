import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

const footerLinks = [
  { href: "/categories", label: "الفئات" },
  { href: "/add-business", label: "أضف عملك" },
  { href: "/ads", label: "الإعلانات" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pb-20 md:pb-0">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo tone="dark" />
          <p className="max-w-md text-sm leading-7 text-slate-600">
            دليل محلي للخدمات الصناعية والمهنية في حمص، مبني لربط أصحاب الورش والعملاء بسرعة ووضوح.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black text-slate-950">روابط سريعة</h2>
          <div className="grid gap-3 text-sm font-semibold text-slate-600">
            {footerLinks.map((link) => (
              <Link className="transition hover:text-orange-600" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black text-slate-950">معلومات التواصل</h2>
          <div className="grid gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden className="size-4 text-orange-500" />
              حمص، سوريا
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone aria-hidden className="size-4 text-orange-500" />
              0000 000 000
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail aria-hidden className="size-4 text-orange-500" />
              info@sna3h-homs.local
            </span>
          </div>
        </div>
      </Container>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة لصناعة حمص
      </div>
    </footer>
  );
}
