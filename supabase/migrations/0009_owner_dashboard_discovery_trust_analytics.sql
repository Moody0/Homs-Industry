create extension if not exists pgcrypto;

alter table public.businesses
add column if not exists price_range text check (price_range is null or price_range in ('budget', 'mid', 'premium')),
add column if not exists service_modes text[] not null default '{}'::text[],
add column if not exists languages text[] not null default '{}'::text[],
add column if not exists payment_methods text[] not null default '{}'::text[],
add column if not exists years_experience integer check (years_experience is null or years_experience >= 0),
add column if not exists owner_bio text,
add column if not exists team_info text,
add column if not exists brochure_url text,
add column if not exists is_verified boolean not null default false,
add column if not exists is_trusted boolean not null default false;

alter table public.reviews
add column if not exists quality_rating integer check (quality_rating is null or quality_rating between 1 and 5),
add column if not exists service_rating integer check (service_rating is null or service_rating between 1 and 5),
add column if not exists value_rating integer check (value_rating is null or value_rating between 1 and 5);

create table if not exists public.business_certificates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text,
  file_url text not null check (length(trim(file_url)) > 0),
  status public.review_status not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_project_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  before_image_url text,
  after_image_url text,
  title text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint business_project_images_has_image check (
    nullif(trim(coalesce(before_image_url, '')), '') is not null
    or nullif(trim(coalesce(after_image_url, '')), '') is not null
  )
);

create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reply text not null check (length(trim(reply)) >= 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (length(trim(reason)) >= 3),
  status public.review_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, user_id)
);

create table if not exists public.review_helpful_votes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create table if not exists public.business_analytics_daily (
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_date date not null default current_date,
  views integer not null default 0 check (views >= 0),
  call_clicks integer not null default 0 check (call_clicks >= 0),
  whatsapp_clicks integer not null default 0 check (whatsapp_clicks >= 0),
  direction_clicks integer not null default 0 check (direction_clicks >= 0),
  profile_clicks integer not null default 0 check (profile_clicks >= 0),
  inquiries integer not null default 0 check (inquiries >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (business_id, event_date)
);

drop trigger if exists business_certificates_set_updated_at on public.business_certificates;
create trigger business_certificates_set_updated_at
before update on public.business_certificates
for each row execute function public.set_updated_at();

drop trigger if exists review_replies_set_updated_at on public.review_replies;
create trigger review_replies_set_updated_at
before update on public.review_replies
for each row execute function public.set_updated_at();

drop trigger if exists review_reports_set_updated_at on public.review_reports;
create trigger review_reports_set_updated_at
before update on public.review_reports
for each row execute function public.set_updated_at();

drop trigger if exists business_analytics_daily_set_updated_at on public.business_analytics_daily;
create trigger business_analytics_daily_set_updated_at
before update on public.business_analytics_daily
for each row execute function public.set_updated_at();

create index if not exists businesses_trust_idx on public.businesses (is_verified, is_trusted, is_featured);
create index if not exists businesses_price_range_idx on public.businesses (price_range);
create index if not exists businesses_service_modes_idx on public.businesses using gin (service_modes);
create index if not exists businesses_languages_idx on public.businesses using gin (languages);
create index if not exists businesses_payment_methods_idx on public.businesses using gin (payment_methods);
create index if not exists business_certificates_business_status_idx on public.business_certificates (business_id, status, created_at desc);
create index if not exists business_project_images_business_sort_idx on public.business_project_images (business_id, sort_order);
create index if not exists review_replies_business_idx on public.review_replies (business_id);
create index if not exists review_reports_status_idx on public.review_reports (status, created_at desc);
create index if not exists review_helpful_votes_review_idx on public.review_helpful_votes (review_id);
create index if not exists business_analytics_daily_date_idx on public.business_analytics_daily (event_date desc);

create or replace function public.search_businesses_v2(
  search_query text default null,
  category_slug text default null,
  area_filter text default null,
  min_rating numeric default null,
  price_filter text default null,
  service_mode_filter text default null,
  language_filter text default null,
  payment_filter text default null,
  open_now boolean default false,
  current_day_filter integer default null,
  current_time_filter time default null,
  user_lat numeric default null,
  user_lng numeric default null,
  max_distance_km numeric default null,
  sort_by text default null
)
returns table (id uuid, distance_km numeric)
language sql
stable
security invoker
set search_path = public
as $$
  with matched as (
    select
      b.id,
      b.is_featured,
      b.rating_average,
      b.reviews_count,
      b.created_at,
      case
        when user_lat is not null
          and user_lng is not null
          and b.latitude is not null
          and b.longitude is not null
        then round((
          6371 * acos(
            least(
              1,
              greatest(
                -1,
                cos(radians(user_lat::double precision))
                * cos(radians(b.latitude::double precision))
                * cos(radians(b.longitude::double precision) - radians(user_lng::double precision))
                + sin(radians(user_lat::double precision))
                * sin(radians(b.latitude::double precision))
              )
            )
          )
        )::numeric, 2)
        else null
      end as distance_km
    from public.businesses b
    join public.categories c on c.id = b.category_id
    left join public.subcategories sc on sc.id = b.subcategory_id
    left join public.areas a on a.id = b.area_id
    where b.status = 'approved'
      and (category_slug is null or c.slug = category_slug)
      and (
        area_filter is null
        or b.area ilike '%' || area_filter || '%'
        or a.slug = area_filter
        or a.name ilike '%' || area_filter || '%'
      )
      and (min_rating is null or b.rating_average >= min_rating)
      and (price_filter is null or b.price_range = price_filter)
      and (service_mode_filter is null or b.service_modes @> array[service_mode_filter])
      and (language_filter is null or b.languages @> array[language_filter])
      and (payment_filter is null or b.payment_methods @> array[payment_filter])
      and (
        open_now = false
        or exists (
          select 1
          from public.business_hours bh
          where bh.business_id = b.id
            and bh.day_of_week = current_day_filter
            and bh.is_closed = false
            and bh.opens_at is not null
            and bh.closes_at is not null
            and current_time_filter >= bh.opens_at
            and current_time_filter <= bh.closes_at
        )
      )
      and (
        search_query is null
        or length(trim(search_query)) = 0
        or b.name ilike '%' || search_query || '%'
        or b.description ilike '%' || search_query || '%'
        or b.area ilike '%' || search_query || '%'
        or b.owner_bio ilike '%' || search_query || '%'
        or b.team_info ilike '%' || search_query || '%'
        or a.name ilike '%' || search_query || '%'
        or c.name ilike '%' || search_query || '%'
        or sc.name ilike '%' || search_query || '%'
        or exists (
          select 1 from public.business_services bs
          where bs.business_id = b.id
            and bs.name ilike '%' || search_query || '%'
        )
        or exists (
          select 1 from public.business_products bp
          where bp.business_id = b.id
            and bp.name ilike '%' || search_query || '%'
        )
      )
  )
  select matched.id, matched.distance_km
  from matched
  where max_distance_km is null
    or matched.distance_km is null
    or matched.distance_km <= max_distance_km
  order by
    case when sort_by = 'distance' then matched.distance_km end asc nulls last,
    matched.is_featured desc,
    matched.rating_average desc,
    matched.reviews_count desc,
    matched.created_at desc;
$$;

create or replace function public.increment_business_analytics(
  target_business_id uuid,
  event_kind text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if event_kind not in ('view', 'call', 'whatsapp', 'directions', 'profile') then
    raise exception 'Invalid analytics event kind';
  end if;

  insert into public.business_analytics_daily (
    business_id,
    event_date,
    views,
    call_clicks,
    whatsapp_clicks,
    direction_clicks,
    profile_clicks,
    inquiries
  )
  values (
    target_business_id,
    current_date,
    case when event_kind = 'view' then 1 else 0 end,
    case when event_kind = 'call' then 1 else 0 end,
    case when event_kind = 'whatsapp' then 1 else 0 end,
    case when event_kind = 'directions' then 1 else 0 end,
    case when event_kind = 'profile' then 1 else 0 end,
    case when event_kind in ('call', 'whatsapp', 'directions') then 1 else 0 end
  )
  on conflict (business_id, event_date) do update
  set
    views = public.business_analytics_daily.views + excluded.views,
    call_clicks = public.business_analytics_daily.call_clicks + excluded.call_clicks,
    whatsapp_clicks = public.business_analytics_daily.whatsapp_clicks + excluded.whatsapp_clicks,
    direction_clicks = public.business_analytics_daily.direction_clicks + excluded.direction_clicks,
    profile_clicks = public.business_analytics_daily.profile_clicks + excluded.profile_clicks,
    inquiries = public.business_analytics_daily.inquiries + excluded.inquiries,
    updated_at = now();
end;
$$;

grant select on public.business_certificates, public.business_project_images, public.review_replies, public.review_reports, public.review_helpful_votes, public.business_analytics_daily to authenticated;
grant select on public.business_certificates, public.business_project_images, public.review_replies, public.review_helpful_votes to anon;
grant insert, update, delete on public.business_certificates, public.business_project_images, public.review_replies, public.review_reports, public.review_helpful_votes to authenticated;
grant execute on function public.search_businesses_v2(text, text, text, numeric, text, text, text, text, boolean, integer, time, numeric, numeric, numeric, text) to anon, authenticated;
grant execute on function public.increment_business_analytics(uuid, text) to anon, authenticated;

alter table public.business_certificates enable row level security;
alter table public.business_project_images enable row level security;
alter table public.review_replies enable row level security;
alter table public.review_reports enable row level security;
alter table public.review_helpful_votes enable row level security;
alter table public.business_analytics_daily enable row level security;

create policy "Public can read approved certificates"
on public.business_certificates for select
using (
  status = 'approved'
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.status = 'approved'
  )
);

create policy "Owners can manage own certificates"
on public.business_certificates for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id) and status = 'pending');

create policy "Admins can manage certificates"
on public.business_certificates for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved project images"
on public.business_project_images for select
using (exists (
  select 1 from public.businesses b
  where b.id = business_id and b.status = 'approved'
));

create policy "Owners can manage own project images"
on public.business_project_images for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id));

create policy "Admins can manage project images"
on public.business_project_images for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read replies on approved reviews"
on public.review_replies for select
using (exists (
  select 1
  from public.reviews r
  join public.businesses b on b.id = r.business_id
  where r.id = review_id
    and r.status = 'approved'
    and b.status = 'approved'
));

create policy "Owners can manage replies for own businesses"
on public.review_replies for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id) and owner_id = auth.uid());

create policy "Admins can manage review replies"
on public.review_replies for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can create own review reports"
on public.review_reports for insert
with check (user_id = auth.uid() and status = 'pending');

create policy "Users can read own review reports"
on public.review_reports for select
using (user_id = auth.uid());

create policy "Admins can manage review reports"
on public.review_reports for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read helpful votes"
on public.review_helpful_votes for select
using (exists (
  select 1
  from public.reviews r
  join public.businesses b on b.id = r.business_id
  where r.id = review_id
    and r.status = 'approved'
    and b.status = 'approved'
));

create policy "Users can manage own helpful votes"
on public.review_helpful_votes for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Owners can read own analytics"
on public.business_analytics_daily for select
using (public.owns_business(business_id));

create policy "Admins can read analytics"
on public.business_analytics_daily for select
using (public.is_admin());
