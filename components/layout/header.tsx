import { Plus, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { HeaderNav } from "@/components/layout/header-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCurrentProfile } from "@/lib/supabase/auth";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "الفئات" },
  { href: "/add-business", label: "أضف عملك" },
  { href: "/ads", label: "الإعلانات" },
  { href: "/contact", label: "تواصل معنا" },
];

export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-[1200] border-b border-white/10 bg-[#071018] text-white shadow-lg shadow-slate-950/10">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20 md:gap-6">
        <Logo className="shrink-0" />

        <HeaderNav items={navItems} />

        <div className="flex items-center gap-2 md:hidden">
          <ButtonLink className="size-10 border-white/15 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white" href="/add-business" variant="outline" aria-label="أضف عملك">
            <Plus aria-hidden className="size-5" />
          </ButtonLink>
          <ButtonLink className="size-10 border-white/15 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white" href={profile ? "/dashboard" : "/login"} variant="outline" aria-label={profile ? "لوحتي" : "تسجيل دخول"}>
            <UserRound aria-hidden className="size-5" />
          </ButtonLink>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href="/add-business" size="sm">
            <Plus aria-hidden className="size-4" />
            أضف عملك
          </ButtonLink>
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}
