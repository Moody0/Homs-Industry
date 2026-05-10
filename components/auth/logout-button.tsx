"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10"
      onClick={() => signOut({ callbackUrl: "/" })}
      title="تسجيل خروج"
      type="button"
    >
      <LogOut aria-hidden className="size-4" />
      <span className="sr-only">تسجيل خروج</span>
    </button>
  );
}
