-- Demo seed for local development and feature review.
-- Do not run this file in production as-is. It creates known demo credentials.

create extension if not exists pgcrypto;

with demo_users(id, username, phone, email) as (
  values
    ('90000000-0000-0000-0000-000000000001'::uuid, 'admin', '+963900000001', 'admin@example.com'),
    ('90000000-0000-0000-0000-000000000002'::uuid, 'owner_demo', '+963900000002', 'owner@example.com'),
    ('90000000-0000-0000-0000-000000000003'::uuid, 'user_demo', '+963900000003', 'user@example.com'),
    ('90000000-0000-0000-0000-000000000004'::uuid, 'reviewer_demo', '+963900000004', 'reviewer@example.com')
)
delete from auth.users u
using demo_users d
where u.id = d.id
   or u.phone = d.phone
   or u.email = d.email
   or u.id in (
     select p.id
     from public.profiles p
     where p.username = d.username::citext
   );

with seed_users(id, username, full_name, email, phone, password, profile_role) as (
  values
    ('90000000-0000-0000-0000-000000000001'::uuid, 'admin', 'مدير صناعة حمص', 'admin@example.com', '+963900000001', 'admin123', 'admin'::public.profile_role),
    ('90000000-0000-0000-0000-000000000002'::uuid, 'owner_demo', 'صاحب ورشة تجريبي', 'owner@example.com', '+963900000002', 'owner123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000003'::uuid, 'user_demo', 'مستخدم تجريبي', 'user@example.com', '+963900000003', 'user123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000004'::uuid, 'reviewer_demo', 'مراجع تجريبي', 'reviewer@example.com', '+963900000004', 'user123456', 'user'::public.profile_role)
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  phone,
  encrypted_password,
  email_confirmed_at,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  email,
  phone,
  crypt(password, gen_salt('bf')),
  now(),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object('email', email, 'full_name', full_name, 'username', username, 'phone', phone),
  now(),
  now(),
  '',
  '',
  '',
  ''
from seed_users
on conflict (id) do update
set
  encrypted_password = excluded.encrypted_password,
  email = excluded.email,
  phone = excluded.phone,
  email_confirmed_at = excluded.email_confirmed_at,
  phone_confirmed_at = excluded.phone_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with seed_users(id, username, full_name, email, phone, password, profile_role) as (
  values
    ('90000000-0000-0000-0000-000000000001'::uuid, 'admin', 'مدير صناعة حمص', 'admin@example.com', '+963900000001', 'admin123', 'admin'::public.profile_role),
    ('90000000-0000-0000-0000-000000000002'::uuid, 'owner_demo', 'صاحب ورشة تجريبي', 'owner@example.com', '+963900000002', 'owner123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000003'::uuid, 'user_demo', 'مستخدم تجريبي', 'user@example.com', '+963900000003', 'user123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000004'::uuid, 'reviewer_demo', 'مراجع تجريبي', 'reviewer@example.com', '+963900000004', 'user123456', 'user'::public.profile_role)
)
delete from auth.identities
where user_id in (select id from seed_users)
   or (provider = 'email' and provider_id in (select email from seed_users))
   or (provider = 'phone' and provider_id in (select phone from seed_users));

with seed_users(id, username, full_name, email, phone, password, profile_role) as (
  values
    ('90000000-0000-0000-0000-000000000001'::uuid, 'admin', 'مدير صناعة حمص', 'admin@example.com', '+963900000001', 'admin123', 'admin'::public.profile_role),
    ('90000000-0000-0000-0000-000000000002'::uuid, 'owner_demo', 'صاحب ورشة تجريبي', 'owner@example.com', '+963900000002', 'owner123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000003'::uuid, 'user_demo', 'مستخدم تجريبي', 'user@example.com', '+963900000003', 'user123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000004'::uuid, 'reviewer_demo', 'مراجع تجريبي', 'reviewer@example.com', '+963900000004', 'user123456', 'user'::public.profile_role)
)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  email,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from seed_users;

with seed_users(id, username, full_name, email, phone, password, profile_role) as (
  values
    ('90000000-0000-0000-0000-000000000001'::uuid, 'admin', 'مدير صناعة حمص', 'admin@example.com', '+963900000001', 'admin123', 'admin'::public.profile_role),
    ('90000000-0000-0000-0000-000000000002'::uuid, 'owner_demo', 'صاحب ورشة تجريبي', 'owner@example.com', '+963900000002', 'owner123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000003'::uuid, 'user_demo', 'مستخدم تجريبي', 'user@example.com', '+963900000003', 'user123456', 'user'::public.profile_role),
    ('90000000-0000-0000-0000-000000000004'::uuid, 'reviewer_demo', 'مراجع تجريبي', 'reviewer@example.com', '+963900000004', 'user123456', 'user'::public.profile_role)
)
insert into public.profiles (id, full_name, username, email, phone, role)
select id, full_name, username, email, phone, profile_role
from seed_users
on conflict (id) do update
set
  full_name = excluded.full_name,
  username = excluded.username,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  updated_at = now();

insert into public.categories (id, name, slug, description, icon_name, sort_order)
values
  ('10000000-0000-0000-0000-000000000010', 'دهانات', 'paints', 'دهانات صناعية ومنزلية ولوازم الطلاء', 'wrench', 100),
  ('10000000-0000-0000-0000-000000000011', 'كهرباء', 'electricity', 'كهرباء منازل وورش ومستلزمات كهربائية', 'cog', 110),
  ('10000000-0000-0000-0000-000000000012', 'سباكة', 'plumbing', 'تمديدات وصيانة صحية ومستلزمات السباكة', 'wrench', 120),
  ('10000000-0000-0000-0000-000000000013', 'ألمنيوم وزجاج', 'aluminum-glass', 'تفصيل ألمنيوم وزجاج واجهات وأبواب', 'house', 130)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.subcategories (id, category_id, name, slug, sort_order)
values
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'دهانات منزلية', 'home-paints', 10),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'تمديد كهرباء', 'electrical-installation', 10),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'صيانة صحية', 'sanitary-maintenance', 10),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'واجهات ألمنيوم', 'aluminum-fronts', 10)
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true;

update public.businesses
set
  owner_id = '90000000-0000-0000-0000-000000000002',
  logo_url = '/images/seed/industrial-logo.svg',
  cover_image_url = case slug
    when 'al-kamal-auto-workshop' then '/images/seed/auto-cover.svg'
    when 'ibdaa-carpentry' then '/images/seed/carpentry-cover.svg'
    when 'al-sham-car-painting' then '/images/seed/auto-cover.svg'
    when 'abu-ahmad-welding' then '/images/seed/welding-cover.svg'
    when 'elite-auto-service' then '/images/seed/auto-cover.svg'
    when 'fine-art-furniture' then '/images/seed/furniture-cover.svg'
    when 'modern-construction-supply' then '/images/seed/construction-cover.svg'
    else cover_image_url
  end
where slug in (
  'al-kamal-auto-workshop',
  'ibdaa-carpentry',
  'al-sham-car-painting',
  'abu-ahmad-welding',
  'elite-auto-service',
  'fine-art-furniture',
  'modern-construction-supply'
);

insert into public.businesses (
  id, owner_id, category_id, subcategory_id, area_id, name, slug, description,
  logo_url, cover_image_url, phone, whatsapp_phone, address, city, area,
  latitude, longitude, status, rejection_reason, is_featured, approved_at
)
values
  (
    '30000000-0000-0000-0000-000000000008', '90000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', '08000000-0000-0000-0000-000000000008',
    'دهانات الحمراء', 'al-hamra-paints', 'دهانات داخلية وخارجية مع خلط ألوان حسب الطلب.',
    '/images/seed/industrial-logo.svg', '/images/seed/construction-cover.svg',
    '0930001008', '963930001008', 'حمص - الحمراء - شارع الحضارة', 'حمص', 'الحمراء',
    34.7342000, 36.7183000, 'approved', null, false, now()
  ),
  (
    '30000000-0000-0000-0000-000000000009', '90000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', '08000000-0000-0000-0000-000000000010',
    'كهرباء الصناعة الحديثة', 'modern-industrial-electricity', 'تمديد لوحات وتحكم وصيانة كهرباء للورش والمعامل.',
    '/images/seed/industrial-logo.svg', '/images/seed/welding-cover.svg',
    '0930001009', '963930001009', 'حمص - المنطقة الصناعية', 'حمص', 'الصناعة',
    34.7098000, 36.7061000, 'pending', null, false, null
  ),
  (
    '30000000-0000-0000-0000-000000000010', '90000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', '08000000-0000-0000-0000-000000000009',
    'ألمنيوم الشامي', 'al-shami-aluminum', 'تفصيل نوافذ وأبواب ألمنيوم، يحتاج الطلب لاستكمال بيانات الترخيص.',
    '/images/seed/industrial-logo.svg', '/images/seed/construction-cover.svg',
    '0930001010', '963930001010', 'حمص - كرم الشامي', 'حمص', 'كرم الشامي',
    34.7308000, 36.7043000, 'rejected', 'الصورة غير واضحة والبيانات تحتاج استكمالاً.', false, null
  )
on conflict (slug) do update
set
  owner_id = excluded.owner_id,
  category_id = excluded.category_id,
  subcategory_id = excluded.subcategory_id,
  area_id = excluded.area_id,
  name = excluded.name,
  description = excluded.description,
  logo_url = excluded.logo_url,
  cover_image_url = excluded.cover_image_url,
  whatsapp_phone = excluded.whatsapp_phone,
  address = excluded.address,
  city = excluded.city,
  area = excluded.area,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  status = excluded.status,
  rejection_reason = excluded.rejection_reason,
  is_featured = excluded.is_featured,
  approved_at = excluded.approved_at;

insert into public.business_images (id, business_id, image_url, alt_text, sort_order, is_cover)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '/images/seed/auto-cover.svg', 'صورة ورشة سيارات', 10, true),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '/images/seed/carpentry-cover.svg', 'صورة منجرة', 10, true),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', '/images/seed/welding-cover.svg', 'صورة ورشة حدادة', 10, true),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006', '/images/seed/furniture-cover.svg', 'صورة معرض موبيليا', 10, true),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', '/images/seed/construction-cover.svg', 'صورة مواد بناء', 10, true),
  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000008', '/images/seed/construction-cover.svg', 'صورة محل دهانات', 10, true)
on conflict (id) do update
set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  is_cover = excluded.is_cover;

insert into public.business_products (business_id, name, description, price, image_url, sort_order)
values
  ('30000000-0000-0000-0000-000000000001', 'زيوت محركات', 'زيوت أصلية للسيارات السياحية', 145000, '/images/seed/auto-cover.svg', 10),
  ('30000000-0000-0000-0000-000000000005', 'فحص كمبيوتر كامل', 'تقرير أعطال إلكترونية للسيارة', 85000, '/images/seed/auto-cover.svg', 10),
  ('30000000-0000-0000-0000-000000000002', 'خزانة مطبخ متر طولي', 'تفصيل خشب MDF حسب الطلب', 525000, '/images/seed/carpentry-cover.svg', 10),
  ('30000000-0000-0000-0000-000000000006', 'باب خشب داخلي', 'باب خشب مع دهان وتركيب', 650000, '/images/seed/furniture-cover.svg', 10),
  ('30000000-0000-0000-0000-000000000007', 'حديد مبروم 12 مم', 'طن حديد للبناء حسب السعر اليومي', 11200000, '/images/seed/construction-cover.svg', 10),
  ('30000000-0000-0000-0000-000000000008', 'دهان داخلي 20 كغ', 'دهان أبيض قابل للتلوين', 310000, '/images/seed/construction-cover.svg', 10)
on conflict (business_id, name) do update
set
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

insert into public.business_services (business_id, name, description, sort_order)
values
  ('30000000-0000-0000-0000-000000000008', 'خلط ألوان', 'تجهيز اللون حسب عينة الزبون.', 10),
  ('30000000-0000-0000-0000-000000000009', 'لوحات تحكم', 'تركيب وصيانة لوحات تحكم صناعية.', 10),
  ('30000000-0000-0000-0000-000000000010', 'تفصيل واجهات', 'واجهات ألمنيوم وزجاج للمحلات.', 10)
on conflict (business_id, name) do update
set description = excluded.description,
    sort_order = excluded.sort_order;

insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
select '30000000-0000-0000-0000-000000000005'::uuid, day_of_week, time '00:00', time '23:59', false
from generate_series(0, 6) as day_of_week
on conflict (business_id, day_of_week) do update
set opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    is_closed = excluded.is_closed;

insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
select '30000000-0000-0000-0000-000000000003'::uuid, day_of_week, null, null, true
from generate_series(0, 6) as day_of_week
on conflict (business_id, day_of_week) do update
set opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    is_closed = excluded.is_closed;

insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
select '30000000-0000-0000-0000-000000000008'::uuid, day_of_week, time '08:30', time '20:00', false
from generate_series(0, 6) as day_of_week
on conflict (business_id, day_of_week) do update
set opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    is_closed = excluded.is_closed;

insert into public.reviews (id, business_id, user_id, rating, comment, status)
values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000003', 5, 'تعامل ممتاز وتشخيص سريع للعطل.', 'approved'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000004', 4, 'الأسعار واضحة والخدمة جيدة.', 'approved'),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000003', 5, 'تفصيل المطبخ كان مرتباً ودقيقاً.', 'approved'),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', '90000000-0000-0000-0000-000000000003', 5, 'مركز ممتاز لفحص السيارات الحديثة.', 'approved'),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', '90000000-0000-0000-0000-000000000004', 4, 'تجاوب سريع وتوفر مواد بناء كثيرة.', 'approved'),
  ('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000008', '90000000-0000-0000-0000-000000000004', 5, 'ألوان دقيقة وخدمة محترمة.', 'pending')
on conflict (business_id, user_id) do update
set
  rating = excluded.rating,
  comment = excluded.comment,
  status = excluded.status,
  updated_at = now();

insert into public.favorites (user_id, business_id)
values
  ('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
  ('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005'),
  ('90000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002')
on conflict (user_id, business_id) do nothing;

insert into public.ads (id, title, description, image_url, alt_text, type, priority, start_date, end_date, link_url, business_id, category_id, is_active)
values
  ('40000000-0000-0000-0000-000000000001', 'ورشة الأمان', 'تصليح السيارات - خصم 20%', '/images/hero-ad.png', 'إعلان ورشة سيارات', 'home_slider', 100, current_date, (current_date + interval '1 year')::date, '/businesses/al-kamal-auto-workshop', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true),
  ('40000000-0000-0000-0000-000000000002', 'معرض الإبداع', 'أرقى أنواع المفروشات', '/images/ad-1.png', 'إعلان مفروشات', 'home_slider', 90, current_date, (current_date + interval '1 year')::date, '/businesses/ibdaa-carpentry', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', true),
  ('40000000-0000-0000-0000-000000000003', 'دهانات المتحدة', 'جودة تدوم', '/images/ad-2.png', 'إعلان دهانات', 'home_slider', 80, current_date, (current_date + interval '1 year')::date, '/categories/paints', null, '10000000-0000-0000-0000-000000000010', true),
  ('40000000-0000-0000-0000-000000000004', 'الحديد أساس البناء', 'لكل احتياجات البناء والتشييد', '/images/ad-3.png', 'إعلان حديد بناء', 'category_ad', 70, current_date, (current_date + interval '1 year')::date, '/categories/home-foundations', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', true),
  ('40000000-0000-0000-0000-000000000005', 'إعلان منتهي للاختبار', 'يظهر في الإدارة فقط ولا يظهر للزوار', '/images/seed/welding-cover.svg', 'إعلان منتهي', 'home_slider', 10, (current_date - interval '20 day')::date, (current_date - interval '1 day')::date, '/categories/welding', null, '10000000-0000-0000-0000-000000000006', true),
  ('40000000-0000-0000-0000-000000000006', 'إعلان معطل للاختبار', 'يظهر في الإدارة فقط لأنه غير فعال', '/images/seed/auto-cover.svg', 'إعلان معطل', 'featured_business', 20, current_date, (current_date + interval '1 year')::date, '/businesses/elite-auto-service', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', false)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  type = excluded.type,
  priority = excluded.priority,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  link_url = excluded.link_url,
  business_id = excluded.business_id,
  category_id = excluded.category_id,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.site_settings (key, value)
values (
  'home_hero',
  jsonb_build_object(
    'image_url', '/images/hero-image.png',
    'alt_text', 'صناعة وحدادة وخدمات صناعية في حمص'
  )
)
on conflict (key) do update
set
  value = excluded.value,
  updated_at = now();

select public.recalculate_business_rating(id)
from public.businesses
where id in (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0000-000000000008'
);
