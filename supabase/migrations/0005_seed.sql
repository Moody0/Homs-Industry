insert into public.areas (id, name, slug, sort_order)
values
  ('08000000-0000-0000-0000-000000000001', 'الغوطة', 'al-ghouta', 10),
  ('08000000-0000-0000-0000-000000000002', 'الزهراء', 'al-zahraa', 20),
  ('08000000-0000-0000-0000-000000000003', 'البياضة', 'al-bayada', 30),
  ('08000000-0000-0000-0000-000000000004', 'باب عمرو', 'bab-amr', 40),
  ('08000000-0000-0000-0000-000000000005', 'الإنشاءات', 'al-inshaat', 50),
  ('08000000-0000-0000-0000-000000000006', 'عكرمة', 'ikrima', 60),
  ('08000000-0000-0000-0000-000000000007', 'الوعر', 'al-waer', 70),
  ('08000000-0000-0000-0000-000000000008', 'الحمراء', 'al-hamra', 80),
  ('08000000-0000-0000-0000-000000000009', 'كرم الشامي', 'karm-al-shami', 90),
  ('08000000-0000-0000-0000-000000000010', 'الصناعة', 'industrial-zone', 100)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

insert into public.categories (id, name, slug, description, icon_name, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'سيارات', 'cars', 'ورش وخدمات صيانة السيارات في حمص', 'car', 10),
  ('10000000-0000-0000-0000-000000000002', 'شاحنات', 'trucks', 'صيانة وتجهيز الشاحنات والمركبات الثقيلة', 'truck', 20),
  ('10000000-0000-0000-0000-000000000003', 'أساس بيت', 'home-foundations', 'مواد ومستلزمات البناء والتشطيب', 'house', 30),
  ('10000000-0000-0000-0000-000000000004', 'موبيليا', 'furniture', 'تصنيع وبيع الأثاث المنزلي والمكتبي', 'sofa', 40),
  ('10000000-0000-0000-0000-000000000005', 'قطع صناعية', 'industrial-parts', 'قطع ومستلزمات صناعية للورش والمعامل', 'cog', 50),
  ('10000000-0000-0000-0000-000000000006', 'حدادة ولحام', 'welding', 'حدادة ولحام وتفصيل المعادن', 'wrench', 60),
  ('10000000-0000-0000-0000-000000000007', 'نجارين', 'carpentry', 'نجارة أبواب ومطابخ وديكور خشبي', 'ruler', 70),
  ('10000000-0000-0000-0000-000000000008', 'تنجيد', 'upholstery', 'تنجيد وفرش وصيانة المفروشات', 'armchair', 80),
  ('10000000-0000-0000-0000-000000000009', 'المزيد', 'more', 'خدمات صناعية ومهنية أخرى', 'ellipsis', 90)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.subcategories (id, category_id, name, slug, sort_order)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ميكانيك سيارات', 'auto-mechanics', 10),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'كهرباء سيارات', 'auto-electricity', 20),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'دهان سيارات', 'car-painting', 30),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'غرف نوم', 'bedrooms', 10),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', 'مطابخ خشبية', 'wood-kitchens', 20),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'أبواب حديد', 'metal-doors', 10),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 'لحام صناعي', 'industrial-welding', 20),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'حديد بناء', 'construction-steel', 10),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'مواد تشطيب', 'finishing-materials', 20)
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.businesses (
  id, category_id, subcategory_id, area_id, name, slug, description, phone, whatsapp_phone, address, city, area,
  latitude, longitude, status, is_featured, rating_average, reviews_count, approved_at
)
values
  (
    '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '08000000-0000-0000-0000-000000000001',
    'ورشة الكمال', 'al-kamal-auto-workshop', 'ميكانيك وصيانة عامة للسيارات مع فحص سريع للأعطال.', '0933123456', '963933123456', 'حمص - الغوطة', 'حمص', 'الغوطة',
    34.7351000, 36.7112000, 'approved', true, 4.60, 18, now()
  ),
  (
    '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', '08000000-0000-0000-0000-000000000002',
    'نجارة الإبداع', 'ibdaa-carpentry', 'تفصيل مطابخ وموبيليا حسب الطلب بجودة عملية.', '0944234567', '963944234567', 'حمص - الزهراء', 'حمص', 'الزهراء',
    34.7533000, 36.7323000, 'approved', false, 4.80, 24, now()
  ),
  (
    '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '08000000-0000-0000-0000-000000000003',
    'دهانات الشام', 'al-sham-car-painting', 'دهان جميع أنواع السيارات ومعالجة الخدوش.', '0932345678', '963932345678', 'حمص - البياضة', 'حمص', 'البياضة',
    34.7450000, 36.7240000, 'approved', false, 4.70, 16, now()
  ),
  (
    '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000007', '08000000-0000-0000-0000-000000000004',
    'حدادة أبو أحمد', 'abu-ahmad-welding', 'حدادة وطرق جميع المعادن للأبواب والشبابيك.', '0935456789', '963935456789', 'حمص - باب عمرو', 'حمص', 'باب عمرو',
    34.7218000, 36.6998000, 'approved', false, 4.50, 12, now()
  ),
  (
    '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '08000000-0000-0000-0000-000000000005',
    'مركز النخبة لصيانة السيارات', 'elite-auto-service', 'ميكانيك وكهرباء وكمبيوتر للسيارات الحديثة.', '0936789012', '963936789012', 'حمص - الإنشاءات', 'حمص', 'الإنشاءات',
    34.7289000, 36.7160000, 'approved', true, 4.90, 31, now()
  ),
  (
    '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '08000000-0000-0000-0000-000000000006',
    'منجرة الفن الراقي', 'fine-art-furniture', 'موبيليا وأبواب وديكورات خشبية بتفصيل دقيق.', '0945567890', '963945567890', 'حمص - عكرمة', 'حمص', 'عكرمة',
    34.7294000, 36.7355000, 'approved', false, 4.80, 27, now()
  ),
  (
    '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', '08000000-0000-0000-0000-000000000007',
    'مؤسسة البناء الحديث', 'modern-construction-supply', 'مقاولات ومواد بناء وتشطيب للمشاريع السكنية.', '0311234567', '963311234567', 'حمص - الوعر', 'حمص', 'الوعر',
    34.7474000, 36.6814000, 'approved', false, 4.70, 21, now()
  )
on conflict (slug) do update
set
  category_id = excluded.category_id,
  subcategory_id = excluded.subcategory_id,
  area_id = excluded.area_id,
  name = excluded.name,
  description = excluded.description,
  whatsapp_phone = excluded.whatsapp_phone,
  address = excluded.address,
  city = excluded.city,
  area = excluded.area,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  status = excluded.status,
  is_featured = excluded.is_featured,
  rating_average = excluded.rating_average,
  reviews_count = excluded.reviews_count,
  approved_at = excluded.approved_at;

insert into public.business_services (business_id, name, description, sort_order)
values
  ('30000000-0000-0000-0000-000000000001', 'ميكانيك سيارات', 'صيانة محرك ومكابح وتعليق.', 10),
  ('30000000-0000-0000-0000-000000000002', 'تفصيل مطابخ', 'مطابخ خشبية حسب القياس.', 10),
  ('30000000-0000-0000-0000-000000000003', 'دهان سيارات', 'دهان كامل أو جزئي ومعالجة خدوش.', 10),
  ('30000000-0000-0000-0000-000000000004', 'لحام معادن', 'لحام وتفصيل أبواب وشبابيك.', 10),
  ('30000000-0000-0000-0000-000000000005', 'فحص كمبيوتر', 'تشخيص أعطال السيارات الحديثة.', 10),
  ('30000000-0000-0000-0000-000000000006', 'ديكور خشبي', 'ديكورات داخلية وأبواب.', 10),
  ('30000000-0000-0000-0000-000000000007', 'مواد بناء', 'توريد حديد وإسمنت ومواد تشطيب.', 10)
on conflict (business_id, name) do update
set description = excluded.description,
    sort_order = excluded.sort_order;

insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
select business_id, day_of_week, time '09:00', time '18:00', false
from (
  values
    ('30000000-0000-0000-0000-000000000001'::uuid),
    ('30000000-0000-0000-0000-000000000002'::uuid),
    ('30000000-0000-0000-0000-000000000003'::uuid),
    ('30000000-0000-0000-0000-000000000004'::uuid),
    ('30000000-0000-0000-0000-000000000005'::uuid),
    ('30000000-0000-0000-0000-000000000006'::uuid),
    ('30000000-0000-0000-0000-000000000007'::uuid)
) as businesses(business_id)
cross join generate_series(1, 6) as day_of_week
on conflict (business_id, day_of_week) do update
set opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    is_closed = excluded.is_closed;

insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
select business_id, 0, null, null, true
from (
  values
    ('30000000-0000-0000-0000-000000000001'::uuid),
    ('30000000-0000-0000-0000-000000000002'::uuid),
    ('30000000-0000-0000-0000-000000000003'::uuid),
    ('30000000-0000-0000-0000-000000000004'::uuid),
    ('30000000-0000-0000-0000-000000000005'::uuid),
    ('30000000-0000-0000-0000-000000000006'::uuid),
    ('30000000-0000-0000-0000-000000000007'::uuid)
) as businesses(business_id)
on conflict (business_id, day_of_week) do update
set opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    is_closed = excluded.is_closed;

insert into public.ads (id, title, description, image_url, alt_text, type, priority, start_date, end_date, link_url, category_id)
values
  ('40000000-0000-0000-0000-000000000001', 'ورشة الأمان', 'تصليح السيارات - خصم 20%', '/images/hero-ad.png', 'ورشة سيارات وصيانة محرك', 'home_slider', 100, current_date, (current_date + interval '1 year')::date, '/categories/cars', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'معرض الإبداع', 'أرقى أنواع المفروشات', '/images/ad-1.png', 'كنبة منزلية ضمن إعلان مفروشات', 'home_slider', 90, current_date, (current_date + interval '1 year')::date, '/categories/furniture', '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000003', 'دهانات المتحدة', 'جودة تدوم', '/images/ad-2.png', 'علبة دهان وفرشاة', 'home_slider', 80, current_date, (current_date + interval '1 year')::date, '/categories/cars', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000004', 'الحديد أساس البناء', 'لكل احتياجات البناء والتشييد', '/images/ad-3.png', 'قضبان حديد بناء', 'category_ad', 70, current_date, (current_date + interval '1 year')::date, '/categories/home-foundations', '10000000-0000-0000-0000-000000000003')
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  type = excluded.type,
  priority = excluded.priority,
  is_active = true,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  link_url = excluded.link_url,
  category_id = excluded.category_id;
