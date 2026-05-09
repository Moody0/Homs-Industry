create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

create type public.profile_role as enum ('user', 'admin');
create type public.business_status as enum ('pending', 'approved', 'rejected');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.ad_type as enum ('home_slider', 'featured_business', 'category_ad');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  username citext not null unique check (length(trim(username::text)) >= 3),
  phone text not null unique check (length(trim(phone)) > 0),
  avatar_url text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  icon_name text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name),
  unique (category_id, id)
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  logo_url text,
  cover_image_url text,
  phone text not null unique check (length(trim(phone)) > 0),
  whatsapp_phone text,
  address text not null check (length(trim(address)) > 0),
  city text not null default 'حمص',
  area text not null check (length(trim(area)) > 0),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status public.business_status not null default 'pending',
  rejection_reason text,
  is_featured boolean not null default false,
  rating_average numeric(3, 2) not null default 0 check (rating_average >= 0 and rating_average <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_coordinates_valid check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  ),
  constraint businesses_subcategory_matches_category foreign key (category_id, subcategory_id)
    references public.subcategories(category_id, id) match simple
);

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint business_hours_time_required check (
    is_closed = true or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  ),
  unique (business_id, day_of_week)
);

create table public.business_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  image_url text not null check (length(trim(image_url)) > 0),
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create table public.business_products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status public.review_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  image_url text not null check (length(trim(image_url)) > 0),
  alt_text text,
  type public.ad_type not null,
  priority integer not null default 0,
  is_active boolean not null default true,
  start_date date not null default current_date,
  end_date date not null,
  link_url text,
  business_id uuid references public.businesses(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create view public.public_profiles as
select id, full_name, avatar_url
from public.profiles;

grant usage on schema public to anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
grant select on public.areas, public.categories, public.subcategories, public.businesses, public.business_hours, public.business_images, public.business_services, public.business_products, public.reviews, public.ads to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.businesses, public.business_hours, public.business_images, public.business_services, public.business_products, public.reviews, public.favorites to authenticated;
grant select, insert, update, delete on public.areas, public.categories, public.subcategories, public.ads to authenticated;
