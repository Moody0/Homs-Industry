import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

export function createClient() {
  const { supabasePublishableKey, supabaseUrl } = getSupabasePublicEnv();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
