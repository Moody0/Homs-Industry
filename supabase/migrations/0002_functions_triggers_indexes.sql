create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, phone, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'مستخدم جديد'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'user_' || replace(left(new.id::text, 8), '-', '')),
    coalesce(nullif(trim(new.phone), ''), nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), '+pending' || replace(new.id::text, '-', '')),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger areas_set_updated_at
before update on public.areas
for each row execute function public.set_updated_at();

create trigger subcategories_set_updated_at
before update on public.subcategories
for each row execute function public.set_updated_at();

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger ads_set_updated_at
before update on public.ads
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.owns_business(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses
    where id = target_business_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.guard_business_owner_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if old.owner_id = auth.uid() then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'Business owner cannot be changed by owner';
    end if;

    new.status = 'pending';
    new.is_featured = old.is_featured;
    new.rating_average = old.rating_average;
    new.reviews_count = old.reviews_count;
    new.approved_at = null;
    new.approved_by = null;
    new.rejection_reason = null;

    return new;
  end if;

  return new;
end;
$$;

create trigger businesses_guard_owner_update
before update on public.businesses
for each row execute function public.guard_business_owner_update();

create or replace function public.recalculate_business_rating(target_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set
    rating_average = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where business_id = target_business_id
        and status = 'approved'
    ), 0),
    reviews_count = (
      select count(*)::integer
      from public.reviews
      where business_id = target_business_id
        and status = 'approved'
    )
  where id = target_business_id;
end;
$$;

create or replace function public.handle_review_rating_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_business_rating(old.business_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and new.business_id is distinct from old.business_id then
    perform public.recalculate_business_rating(old.business_id);
  end if;

  perform public.recalculate_business_rating(new.business_id);
  return new;
end;
$$;

create trigger reviews_rating_changed
after insert or update or delete on public.reviews
for each row execute function public.handle_review_rating_change();

create or replace function public.search_businesses(
  search_query text default null,
  category_slug text default null,
  area_filter text default null,
  min_rating numeric default null
)
returns setof public.businesses
language sql
stable
security invoker
set search_path = public
as $$
  select b.*
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
    and (
      search_query is null
      or length(trim(search_query)) = 0
      or b.name ilike '%' || search_query || '%'
      or b.description ilike '%' || search_query || '%'
      or b.area ilike '%' || search_query || '%'
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
  order by b.is_featured desc, b.rating_average desc, b.reviews_count desc, b.created_at desc;
$$;

create index profiles_role_idx on public.profiles (role);
create index areas_sort_idx on public.areas (sort_order, name);
create index categories_active_sort_idx on public.categories (is_active, sort_order, name);
create index subcategories_category_sort_idx on public.subcategories (category_id, is_active, sort_order, name);
create index businesses_status_created_idx on public.businesses (status, created_at desc);
create index businesses_status_rating_idx on public.businesses (status, rating_average desc, reviews_count desc);
create index businesses_category_status_idx on public.businesses (category_id, status);
create index businesses_subcategory_status_idx on public.businesses (subcategory_id, status);
create index businesses_area_status_idx on public.businesses (area_id, status);
create index businesses_owner_idx on public.businesses (owner_id);
create index businesses_featured_idx on public.businesses (is_featured) where is_featured = true;
create index businesses_location_idx on public.businesses (city, area);
create index businesses_coordinates_idx on public.businesses (latitude, longitude) where latitude is not null and longitude is not null;
create index businesses_name_trgm_idx on public.businesses using gin (name gin_trgm_ops);
create index businesses_area_trgm_idx on public.businesses using gin (area gin_trgm_ops);
create index business_images_business_sort_idx on public.business_images (business_id, sort_order);
create index business_hours_business_day_idx on public.business_hours (business_id, day_of_week);
create index business_services_business_sort_idx on public.business_services (business_id, sort_order);
create index business_services_name_trgm_idx on public.business_services using gin (name gin_trgm_ops);
create index business_products_business_sort_idx on public.business_products (business_id, sort_order);
create index business_products_name_trgm_idx on public.business_products using gin (name gin_trgm_ops);
create index reviews_business_status_idx on public.reviews (business_id, status, created_at desc);
create index reviews_user_idx on public.reviews (user_id);
create index favorites_business_idx on public.favorites (business_id);
create index ads_active_type_priority_idx on public.ads (is_active, type, priority desc, start_date, end_date);
create index ads_business_idx on public.ads (business_id);
create index ads_category_idx on public.ads (category_id);

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_business(uuid) to authenticated;
grant execute on function public.search_businesses(text, text, text, numeric) to anon, authenticated;
