create table if not exists public.auth_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(trim(email)) > 0),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.auth_users (id, email, password_hash)
select
  p.id,
  coalesce(nullif(p.email::text, ''), nullif(u.email, ''), 'legacy-' || p.id::text || '@local.invalid'),
  ''
from public.profiles p
left join auth.users u on u.id = p.id
on conflict (id) do nothing;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_profiles_auth_users'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint fk_profiles_auth_users
    foreign key (id) references public.auth_users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_auth_users_email on public.auth_users(email);

revoke all on public.auth_users from anon, authenticated;
grant all on public.auth_users to service_role;

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
