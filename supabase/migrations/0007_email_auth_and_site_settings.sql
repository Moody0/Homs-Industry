alter table public.profiles
add column if not exists email citext unique;

create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, email, phone, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'مستخدم جديد'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'user_' || replace(left(new.id::text, 8), '-', '')),
    nullif(trim(coalesce(new.email, new.raw_user_meta_data ->> 'email')), '')::citext,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), '+pending' || replace(new.id::text, '-', '')),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    username = excluded.username,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.resolve_login_email(login_identifier text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email::text
  from public.profiles
  where username = trim(login_identifier)::citext
     or email = trim(login_identifier)::citext
  limit 1;
$$;

create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = trim(candidate_username)::citext
  );
$$;

grant select on public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
grant execute on function public.is_username_available(text) to anon, authenticated;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

insert into public.site_settings (key, value)
values (
  'home_hero',
  jsonb_build_object(
    'image_url', '/images/hero-image.png',
    'alt_text', 'خدمات صناعية في حمص'
  )
)
on conflict (key) do update
set value = public.site_settings.value || excluded.value;
