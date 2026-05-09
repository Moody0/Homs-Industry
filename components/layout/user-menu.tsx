import { LogOut, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/auth";
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
      <form action={logoutAction}>
        <button
          className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10"
          title="تسجيل خروج"
          type="submit"
        >
          <LogOut aria-hidden className="size-4" />
          <span className="sr-only">تسجيل خروج</span>
        </button>
      </form>
    </div>
  );
}
