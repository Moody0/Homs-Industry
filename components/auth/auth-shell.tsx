import Link from "next/link";
import type { ReactNode } from "react";
import { Factory } from "lucide-react";
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
    <Container className="grid min-h-[calc(100vh-5rem)] place-items-center py-10">
      <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1fr_420px]">
        <div className="relative hidden bg-[#071018] p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(7,16,24,0.98),rgba(7,16,24,0.84))]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex items-center gap-3 text-2xl font-black">
              <span className="grid size-12 place-items-center rounded-full bg-orange-500 text-white">
                <Factory aria-hidden className="size-7" />
              </span>
              صناعة <span className="text-orange-400">حمص</span>
            </div>
            <div className="space-y-4">
              <p className="text-4xl font-black leading-tight">
                بوابتك إلى الورش والخدمات الصناعية في حمص
              </p>
              <p className="max-w-md text-sm leading-7 text-white/70">
                حافظنا على نفس الهوية البصرية المستوحاة من الصورة: خلفية صناعية داكنة، شرارات برتقالية، وبطاقات عملية واضحة.
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h1 className="text-3xl font-black text-slate-950">{title}</h1>
            <p className="text-sm leading-7 text-slate-600">{description}</p>
          </div>
          {children}
          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            {footerText}{" "}
            <Link className="font-black text-orange-600 hover:text-orange-700" href={footerHref}>
              {footerLinkText}
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
