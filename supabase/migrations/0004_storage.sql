insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('business-images', 'business-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('ad-images', 'ad-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read marketplace images"
on storage.objects for select
using (bucket_id in ('business-images', 'category-images', 'ad-images'));

create policy "Users can upload own business images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own business images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own business images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can manage category images"
on storage.objects for all
to authenticated
using (bucket_id = 'category-images' and public.is_admin())
with check (bucket_id = 'category-images' and public.is_admin());

create policy "Admins can manage ad images"
on storage.objects for all
to authenticated
using (bucket_id = 'ad-images' and public.is_admin())
with check (bucket_id = 'ad-images' and public.is_admin());

create policy "Admins can manage business images"
on storage.objects for all
to authenticated
using (bucket_id = 'business-images' and public.is_admin())
with check (bucket_id = 'business-images' and public.is_admin());
