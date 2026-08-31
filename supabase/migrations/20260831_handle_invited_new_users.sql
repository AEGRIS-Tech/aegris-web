begin;

-- =========================================================
-- AEGRIS
-- NEW USER PROVISIONING WITH ORGANIZATION INVITATIONS
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
  v_has_pending_invitation boolean;
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
  -- 2. CHECK FOR ACTIVE ORGANIZATION INVITATION
  -- =======================================================

  select exists (
    select 1
    from public.organization_invitations oi
    where lower(oi.email) = lower(new.email)
      and oi.status = 'pending'
      and oi.expires_at > now()
  )
  into v_has_pending_invitation;

  -- =======================================================
  -- 3. INVITED USER
  --
  -- Do not create a personal organization.
  -- Membership and active organization will be created
  -- only after the invitation is explicitly accepted.
  -- =======================================================

  if v_has_pending_invitation then
    return new;
  end if;

  -- =======================================================
  -- 4. NORMAL SIGNUP -> CREATE DEFAULT ORGANIZATION
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
  -- 5. MAKE NEW USER OWNER
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
  -- 6. SET ACTIVE ORGANIZATION
  -- =======================================================

  update public.profiles
  set active_organization_id = v_organization_id
  where id = new.id;

  return new;
end;
$$;

revoke all
on function public.handle_new_user()
from public, anon, authenticated, service_role;

commit;