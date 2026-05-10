-- ============================================
-- NEXTAUTH SETUP - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This creates the tables needed for NextAuth authentication
-- 
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" or press Ctrl+Enter
-- ============================================

-- Create auth_users table for NextAuth with hashed passwords
CREATE TABLE IF NOT EXISTS public.auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update profiles to reference auth_users (if not already done)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profiles_auth_users'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profiles_auth_users 
    FOREIGN KEY (id) REFERENCES public.auth_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON public.auth_users(email);

-- Create NextAuth tables for sessions and verification tokens
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nextauth_accounts_userId ON public.nextauth_accounts("userId");
CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_userId ON public.nextauth_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_expires ON public.nextauth_sessions(expires);

-- Grant permissions (adjust if needed based on your RLS policies)
GRANT ALL ON public.auth_users TO authenticated;
GRANT ALL ON public.auth_users TO anon;
GRANT ALL ON public.nextauth_users TO authenticated;
GRANT ALL ON public.nextauth_users TO anon;
GRANT ALL ON public.nextauth_accounts TO authenticated;
GRANT ALL ON public.nextauth_accounts TO anon;
GRANT ALL ON public.nextauth_sessions TO authenticated;
GRANT ALL ON public.nextauth_sessions TO anon;
GRANT ALL ON public.nextauth_verification_tokens TO authenticated;
GRANT ALL ON public.nextauth_verification_tokens TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ NextAuth tables created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - auth_users';
  RAISE NOTICE '  - nextauth_users';
  RAISE NOTICE '  - nextauth_accounts';
  RAISE NOTICE '  - nextauth_sessions';
  RAISE NOTICE '  - nextauth_verification_tokens';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test registration at: http://localhost:3000/register';
END $$;
