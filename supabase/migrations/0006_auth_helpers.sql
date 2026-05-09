create or replace function public.resolve_login_phone(login_identifier text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select phone
  from public.profiles
  where username = trim(login_identifier)::citext
  limit 1;
$$;

grant execute on function public.resolve_login_phone(text) to anon, authenticated;
