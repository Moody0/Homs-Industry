alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_hours enable row level security;
alter table public.business_images enable row level security;
alter table public.business_services enable row level security;
alter table public.business_products enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.ads enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and role = 'user');

create policy "Admins can manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read areas"
on public.areas for select
using (true);

create policy "Admins can manage areas"
on public.areas for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

create policy "Admins can manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active subcategories"
on public.subcategories for select
using (is_active = true);

create policy "Admins can manage subcategories"
on public.subcategories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved businesses"
on public.businesses for select
using (status = 'approved');

create policy "Owners can read own businesses"
on public.businesses for select
using (owner_id = auth.uid());

create policy "Users can submit pending businesses"
on public.businesses for insert
with check (owner_id = auth.uid() and status = 'pending' and is_featured = false);

create policy "Owners can update own pending businesses"
on public.businesses for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid() and status = 'pending' and is_featured = false);

create policy "Admins can manage businesses"
on public.businesses for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved business images"
on public.business_images for select
using (exists (
  select 1 from public.businesses b
  where b.id = business_id and b.status = 'approved'
));

create policy "Owners can manage own business images"
on public.business_images for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id));

create policy "Admins can manage business images"
on public.business_images for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved business hours"
on public.business_hours for select
using (exists (
  select 1 from public.businesses b
  where b.id = business_id and b.status = 'approved'
));

create policy "Owners can manage own business hours"
on public.business_hours for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id));

create policy "Admins can manage business hours"
on public.business_hours for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved business services"
on public.business_services for select
using (exists (
  select 1 from public.businesses b
  where b.id = business_id and b.status = 'approved'
));

create policy "Owners can manage own business services"
on public.business_services for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id));

create policy "Admins can manage business services"
on public.business_services for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved business products"
on public.business_products for select
using (exists (
  select 1 from public.businesses b
  where b.id = business_id and b.status = 'approved'
));

create policy "Owners can manage own business products"
on public.business_products for all
using (public.owns_business(business_id))
with check (public.owns_business(business_id));

create policy "Admins can manage business products"
on public.business_products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved reviews"
on public.reviews for select
using (
  status = 'approved'
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.status = 'approved'
  )
);

create policy "Users can read own reviews"
on public.reviews for select
using (user_id = auth.uid());

create policy "Users can create own reviews"
on public.reviews for insert
with check (
  user_id = auth.uid()
  and status = 'approved'
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.status = 'approved'
  )
);

create policy "Users can update own reviews"
on public.reviews for update
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'approved');

create policy "Users can delete own reviews"
on public.reviews for delete
using (user_id = auth.uid());

create policy "Admins can manage reviews"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read own favorites"
on public.favorites for select
using (user_id = auth.uid());

create policy "Users can create own favorites"
on public.favorites for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.status = 'approved'
  )
);

create policy "Users can delete own favorites"
on public.favorites for delete
using (user_id = auth.uid());

create policy "Admins can manage favorites"
on public.favorites for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active ads"
on public.ads for select
using (
  is_active = true
  and start_date <= current_date
  and end_date >= current_date
);

create policy "Admins can manage ads"
on public.ads for all
using (public.is_admin())
with check (public.is_admin());
