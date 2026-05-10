import { MobileBottomNavClient } from "@/components/layout/mobile-bottom-nav-client";
import { getCurrentProfile } from "@/lib/supabase/auth";

export async function MobileBottomNav() {
  const profile = await getCurrentProfile();
  const items = [
    { href: "/", label: "الرئيسية", icon: "home" as const },
    { href: "/categories", label: "الفئات", icon: "categories" as const },
    { href: "/search", label: "بحث", icon: "search" as const },
    { href: "/add-business", label: "أضف عملك", icon: "plus" as const },
    { href: profile ? "/dashboard" : "/login", label: profile ? "لوحتي" : "حسابي", icon: "dashboard" as const },
  ];

  return <MobileBottomNavClient items={items} />;
}
