create or replace function public.is_phone_available(candidate_phone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where phone = trim(candidate_phone)
  );
$$;

grant execute on function public.is_phone_available(text) to anon, authenticated;
