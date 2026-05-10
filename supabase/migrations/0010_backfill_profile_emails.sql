update public.profiles p
set
  email = u.email::citext,
  updated_at = now()
from auth.users u
where p.id = u.id
  and p.email is null
  and u.email is not null;

create or replace function public.resolve_login_email(login_identifier text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email::text
  from public.profiles
  where username = trim(login_identifier)::citext
     or email = trim(login_identifier)::citext
  limit 1;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;
