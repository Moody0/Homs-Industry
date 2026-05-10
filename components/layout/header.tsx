import Link from "next/link";
import { Plus, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "الرئيسية", active: true },
  { href: "/categories", label: "الفئات" },
  { href: "/add-business", label: "أضف عملك" },
  { href: "/ads", label: "الإعلانات" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071018] text-white shadow-lg shadow-slate-950/10">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20 md:gap-6">
        <Logo className="shrink-0" />

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className={cn(
                "relative px-4 py-7 text-sm font-bold text-white/80 transition hover:text-white",
                item.active && "text-white after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-orange-500",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ButtonLink className="size-10 border-white/15 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white" href="/login" variant="outline" aria-label="تسجيل دخول">
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
