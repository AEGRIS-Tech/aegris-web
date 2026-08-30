begin;

-- =========================================================
-- AEGRIS
-- AUTOMATIC ORGANIZATION PROVISIONING FOR NEW USERS
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
begin

  -- =======================================================
  -- 1. CREATE PROFILE
  -- =======================================================

  insert into public.profiles (
    id,
    account_type
  )
  values (
    new.id,
    'active'
  )
  on conflict (id) do nothing;

  -- =======================================================
  -- 2. CREATE DEFAULT ORGANIZATION
  -- =======================================================

  insert into public.organizations (
    name,
    created_by,
    status
  )
  values (
    'Moje organizace',
    new.id,
    'active'
  )
  returning id
  into v_organization_id;

  -- =======================================================
  -- 3. MAKE NEW USER OWNER
  -- =======================================================

  insert into public.organization_members (
    organization_id,
    user_id,
    role
  )
  values (
    v_organization_id,
    new.id,
    'owner'
  );

  -- =======================================================
  -- 4. SET ACTIVE ORGANIZATION
  -- =======================================================

  update public.profiles
  set active_organization_id = v_organization_id
  where id = new.id;

  return new;
end;
$$;

-- Trigger function must not be callable directly from API roles.

revoke all
on function public.handle_new_user()
from public, anon, authenticated, service_role;

commit;