-- AEGRIS: profile/access foundation
--
-- Goals:
-- 1) Backfill profiles for historical auth users.
-- 2) Make automatic profile creation reproducible from Git.
-- 3) Prepare profiles for server-authoritative account access checks.
--
-- Existing users without a profile are treated as standard active users.
-- Demo users already provisioned with a profile are not modified.

begin;

-- =========================================================
-- 1. BACKFILL HISTORICAL AUTH USERS
-- =========================================================

insert into public.profiles (
  id,
  account_type
)
select
  u.id,
  'active'
from auth.users u
left join public.profiles p
  on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- =========================================================
-- 2. AUTOMATIC PROFILE CREATION
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    account_type
  )
  values (
    new.id,
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger functions should not be callable by API roles directly.
revoke all
on function public.handle_new_user()
from public, anon, authenticated;

-- Recreate deterministically.
drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

commit;
