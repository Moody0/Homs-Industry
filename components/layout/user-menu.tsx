import { LayoutDashboard, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/supabase/auth";

export async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <ButtonLink className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" href="/login" variant="outline">
        <UserRound aria-hidden className="size-4" />
        تسجيل دخول
      </ButtonLink>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ButtonLink className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" href="/favorites" variant="outline">
        <UserRound aria-hidden className="size-4" />
        {profile.full_name}
      </ButtonLink>
      <ButtonLink className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" href="/dashboard" variant="outline">
        <LayoutDashboard aria-hidden className="size-4" />
        لوحتي
      </ButtonLink>
      <LogoutButton />
    </div>
  );
}
