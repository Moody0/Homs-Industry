-- Smoke checks for صناعة حمص RLS and database behavior.
-- Run after applying migrations and seed data in a Supabase SQL session.
-- Replace UUID placeholders with real registered users when checking owner/admin behavior.

-- 1. Anonymous users should only see approved businesses and active date-valid ads.
set local role anon;
select count(*) as anon_visible_non_approved_businesses
from public.businesses
where status <> 'approved';

select count(*) as anon_visible_inactive_ads
from public.ads
where is_active = false
   or start_date > current_date
   or end_date < current_date;

-- 2. Public business children should only be visible when connected to approved businesses.
select count(*) as anon_visible_unapproved_business_images
from public.business_images bi
join public.businesses b on b.id = bi.business_id
where b.status <> 'approved';

-- 3. Approved review count/average should ignore pending/rejected reviews.
reset role;
select public.recalculate_business_rating('30000000-0000-0000-0000-000000000001'::uuid);
select id, rating_average, reviews_count
from public.businesses
where id = '30000000-0000-0000-0000-000000000001'::uuid;

-- 4. Storage bucket policy inspection.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('business-images', 'category-images', 'ad-images')
order by id;

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- 5. Policy inventory for core marketplace tables.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'areas',
    'categories',
    'subcategories',
    'businesses',
    'business_hours',
    'business_images',
    'business_services',
    'business_products',
    'reviews',
    'favorites',
    'ads'
  )
order by tablename, policyname;
