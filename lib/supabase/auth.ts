import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { dbQuery } from "@/lib/db/postgres";

export type ProfileRole = "user" | "admin";

export type CurrentProfile = {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  avatar_url: string | null;
  role: ProfileRole;
};

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
});

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { rows } = await dbQuery<CurrentProfile>(
    "select id::text, full_name, username::text, phone, avatar_url, role from public.profiles where id = $1 limit 1",
    [user.id],
  );

  const profile = rows[0];
  if (!profile) {
    return null;
  }

  return profile;
});

export async function getCurrentUserRole() {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}

export async function isCurrentUserAdmin() {
  return (await getCurrentUserRole()) === "admin";
}

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireProfile(redirectTo = "/login") {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(redirectTo);
  }

  return profile;
}

export async function requireAdmin(redirectTo = "/") {
  const profile = await requireProfile("/login");

  if (profile.role !== "admin") {
    redirect(redirectTo);
  }

  return profile;
}
