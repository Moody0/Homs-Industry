/**
 * Apply NextAuth migrations directly to Supabase database
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log("🚀 Applying NextAuth migrations...\n");

  try {
    // Create auth_users table
    console.log("📝 Creating auth_users table...");
    const { error: authUsersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.auth_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0),
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_auth_users_email ON public.auth_users(email);
      `
    });

    if (authUsersError) {
      console.error("❌ Error creating auth_users:", authUsersError.message);
      console.log("\n⚠️  The exec_sql function doesn't exist. You need to apply migrations manually.");
      console.log("\n📋 Follow these steps:");
      console.log("1. Go to: https://supabase.com/dashboard");
      console.log("2. Select your project");
      console.log("3. Click 'SQL Editor' in the left sidebar");
      console.log("4. Click 'New Query'");
      console.log("5. Copy the content from: supabase/migrations/APPLY_THIS_MANUALLY.sql");
      console.log("6. Paste and click 'Run'\n");
      process.exit(1);
    }

    console.log("✅ auth_users table created");

    // Create NextAuth tables
    console.log("📝 Creating NextAuth tables...");
    const { error: nextAuthError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.nextauth_users (
          id TEXT NOT NULL PRIMARY KEY,
          name TEXT,
          email TEXT,
          "emailVerified" TIMESTAMPTZ,
          image TEXT
        );

        CREATE TABLE IF NOT EXISTS public.nextauth_accounts (
          "userId" TEXT NOT NULL REFERENCES public.nextauth_users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY ("userId", provider, "providerAccountId")
        );

        CREATE TABLE IF NOT EXISTS public.nextauth_sessions (
          "sessionToken" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES public.nextauth_users(id) ON DELETE CASCADE,
          expires TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS public.nextauth_verification_tokens (
          email TEXT NOT NULL,
          token TEXT NOT NULL,
          expires TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (email, token)
        );

        CREATE INDEX IF NOT EXISTS idx_nextauth_accounts_userId ON public.nextauth_accounts("userId");
        CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_userId ON public.nextauth_sessions("userId");
        CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_expires ON public.nextauth_sessions(expires);
      `
    });

    if (nextAuthError) {
      console.error("❌ Error creating NextAuth tables:", nextAuthError.message);
      process.exit(1);
    }

    console.log("✅ NextAuth tables created");

    console.log("\n✅ All migrations applied successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Run: npx tsx scripts/test-auth.ts");
    console.log("2. Start dev server: npm run dev");
    console.log("3. Test registration: http://localhost:3000/register\n");

  } catch (error) {
    console.error("❌ Error applying migrations:", error);
    process.exit(1);
  }
}

applyMigrations();
