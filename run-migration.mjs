import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://svyltfyigguqsejligby.supabase.co";
const supabaseKey = "sb_publishable_4b8G0N3OOFar_EM_K5G-2Q_kDIgcimn";

const client = createClient(supabaseUrl, supabaseKey);

const sql = `
create table if not exists public.auth_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(trim(email)) > 0),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists fk_profiles_auth_users;
alter table public.profiles
add constraint fk_profiles_auth_users 
foreign key (id) references public.auth_users(id) on delete cascade;

create index if not exists idx_auth_users_email on public.auth_users(email);

create table if not exists public.nextauth_users (
  id text not null primary key,
  name text,
  email text,
  "emailVerified" timestamptz,
  image text
);

create table if not exists public.nextauth_accounts (
  "userId" text not null references public.nextauth_users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key ("userId", provider, "providerAccountId")
);

create table if not exists public.nextauth_sessions (
  sessionToken text not null primary key,
  "userId" text not null references public.nextauth_users(id) on delete cascade,
  expires timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nextauth_verification_tokens (
  email text not null,
  token text not null,
  expires timestamptz not null,
  primary key (email, token)
);

create index if not exists idx_nextauth_accounts_userId on public.nextauth_accounts("userId");
create index if not exists idx_nextauth_sessions_userId on public.nextauth_sessions("userId");
create index if not exists idx_nextauth_sessions_expires on public.nextauth_sessions(expires);
`;

async function runMigration() {
  try {
    const { error } = await client.rpc("exec", { sql });
    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }
    console.log("Migration completed successfully!");
  } catch (e) {
    console.error("Error running migration:", e);
    process.exit(1);
  }
}

runMigration();
