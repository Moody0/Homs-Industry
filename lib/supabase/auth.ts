import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
});

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, phone, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as CurrentProfile;
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
