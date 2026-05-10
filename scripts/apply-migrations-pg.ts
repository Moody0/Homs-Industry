/**
 * Apply NextAuth migrations using direct PostgreSQL connection
 * Run with: npx tsx scripts/apply-migrations-pg.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { Client } from "pg";

const dbUrl = process.env.SUPABASE_DB_POOLER_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("❌ Missing SUPABASE_DB_URL or SUPABASE_DB_POOLER_URL in .env.local");
  process.exit(1);
}

async function applyMigrations() {
  const client = new Client({ connectionString: dbUrl });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected!\n");

    console.log("📝 Creating auth_users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.auth_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("✅ auth_users table created");

    console.log("📝 Creating index on auth_users.email...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_users_email ON public.auth_users(email);
    `);
    console.log("✅ Index created");

    console.log("📝 Creating nextauth_users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.nextauth_users (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT,
        email TEXT,
        "emailVerified" TIMESTAMPTZ,
        image TEXT
      );
    `);
    console.log("✅ nextauth_users table created");

    console.log("📝 Creating nextauth_accounts table...");
    await client.query(`
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
    `);
    console.log("✅ nextauth_accounts table created");

    console.log("📝 Creating nextauth_sessions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.nextauth_sessions (
        "sessionToken" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES public.nextauth_users(id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("✅ nextauth_sessions table created");

    console.log("📝 Creating nextauth_verification_tokens table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.nextauth_verification_tokens (
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (email, token)
      );
    `);
    console.log("✅ nextauth_verification_tokens table created");

    console.log("📝 Creating indexes...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nextauth_accounts_userId ON public.nextauth_accounts("userId");
      CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_userId ON public.nextauth_sessions("userId");
      CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_expires ON public.nextauth_sessions(expires);
    `);
    console.log("✅ Indexes created");

    console.log("📝 Granting permissions...");
    await client.query(`
      REVOKE ALL ON public.auth_users FROM authenticated;
      REVOKE ALL ON public.auth_users FROM anon;
      GRANT ALL ON public.auth_users TO service_role;
      GRANT ALL ON public.nextauth_users TO authenticated;
      GRANT ALL ON public.nextauth_users TO anon;
      GRANT ALL ON public.nextauth_accounts TO authenticated;
      GRANT ALL ON public.nextauth_accounts TO anon;
      GRANT ALL ON public.nextauth_sessions TO authenticated;
      GRANT ALL ON public.nextauth_sessions TO anon;
      GRANT ALL ON public.nextauth_verification_tokens TO authenticated;
      GRANT ALL ON public.nextauth_verification_tokens TO anon;
    `);
    console.log("✅ Permissions granted");

    console.log("\n✅ All migrations applied successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Run: npx tsx scripts/test-auth.ts");
    console.log("2. Start dev server: npm run dev");
    console.log("3. Test registration: http://localhost:3000/register\n");

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error applying migrations:", message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
