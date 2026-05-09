-- Safe compatibility migration for admin hardening.
-- Adds missing objects/columns without dropping production data.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'review_status'
  ) then
    create type public.review_status as enum ('pending', 'approved', 'rejected');
  end if;
end;
$$;

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
add column if not exists area_id uuid,
add column if not exists rejection_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_area_id_fkey'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
    add constraint businesses_area_id_fkey
    foreign key (area_id) references public.areas(id) on delete set null;
  end if;
end;
$$;

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, day_of_week),
  constraint business_hours_time_required check (
    is_closed = true or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

alter table public.reviews
add column if not exists status public.review_status not null default 'approved';

create index if not exists businesses_area_status_idx on public.businesses (area_id, status);
create index if not exists business_hours_business_day_idx on public.business_hours (business_id, day_of_week);
create index if not exists reviews_business_status_idx on public.reviews (business_id, status, created_at desc);

alter table public.areas enable row level security;
alter table public.business_hours enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'areas'
      and policyname = 'Public can read areas'
  ) then
    create policy "Public can read areas"
    on public.areas for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'areas'
      and policyname = 'Admins can manage areas'
  ) then
    create policy "Admins can manage areas"
    on public.areas for all
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'business_hours'
      and policyname = 'Public can read approved business hours'
  ) then
    create policy "Public can read approved business hours"
    on public.business_hours for select
    using (exists (
      select 1 from public.businesses b
      where b.id = business_id and b.status = 'approved'
    ));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'business_hours'
      and policyname = 'Admins can manage business hours'
  ) then
    create policy "Admins can manage business hours"
    on public.business_hours for all
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end;
$$;
