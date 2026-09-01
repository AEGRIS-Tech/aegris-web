begin;

-- =========================================================
-- AEGRIS ORGANIZATION MEMBER MANAGEMENT
--
-- BezpeÄŤnĂ© serverovĂ© RPC pro:
-- - zmÄ›nu role ÄŤlena
-- - odebrĂˇnĂ­ ÄŤlena
-- - atomickou ochranu poslednĂ­ho ownera
-- - opravu profiles.active_organization_id po odebrĂˇnĂ­ ÄŤlena
--
-- Funkce jsou urÄŤeny pouze pro service_role.
-- AutorizaÄŤnĂ­ pravidla owner/admin zĹŻstĂˇvajĂ­ v serverovĂ©m API.
-- =========================================================


-- =========================================================
-- 1. UPDATE MEMBER ROLE
-- =========================================================

create or replace function public.update_organization_member_role(
  p_organization_id uuid,
  p_membership_id uuid,
  p_new_role text
)
returns table (
  ok boolean,
  code text,
  previous_role text,
  new_role text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_locked_organization_id uuid;
  v_old_role text;
  v_owner_count bigint;
begin
  /*
   * Zamkneme Ĺ™Ăˇdek organizace.
   *
   * VĹˇechny zmÄ›ny membershipĹŻ pĹ™es tyto RPC se tĂ­m
   * pro jednu organizaci serializujĂ­ a dva soubÄ›ĹľnĂ©
   * requesty nemohou souÄŤasnÄ› odstranit poslednĂ­ ownery.
   */
  select o.id
  into v_locked_organization_id
  from public.organizations o
  where o.id = p_organization_id
  for update;

  if v_locked_organization_id is null then
    return query
    select
      false,
      'ORGANIZATION_NOT_FOUND'::text,
      null::text,
      null::text;

    return;
  end if;


  /*
   * Owner se pĹ™es bÄ›Ĺľnou sprĂˇvu rolĂ­ nepĹ™idÄ›luje.
   * PĹ™Ă­padnĂ˝ pĹ™evod vlastnictvĂ­ bude samostatnĂˇ operace.
   */
  if p_new_role not in (
    'admin',
    'member',
    'viewer'
  ) then
    return query
    select
      false,
      'ROLE_INVALID'::text,
      null::text,
      null::text;

    return;
  end if;


  /*
   * Membership musĂ­ patĹ™it do organizace pĹ™edanĂ© serverem.
   */
  select om.role
  into v_old_role
  from public.organization_members om
  where om.id = p_membership_id
    and om.organization_id = p_organization_id
  for update;

  if v_old_role is null then
    return query
    select
      false,
      'MEMBERSHIP_NOT_FOUND'::text,
      null::text,
      null::text;

    return;
  end if;


  /*
   * StejnĂˇ role = bezpeÄŤnĂ˝ no-op.
   */
  if v_old_role = p_new_role then
    return query
    select
      true,
      'NO_CHANGE'::text,
      v_old_role,
      v_old_role;

    return;
  end if;


  /*
   * Pokud degradujeme ownera, musĂ­ v organizaci
   * zĹŻstat alespoĹ jeden dalĹˇĂ­ owner.
   */
  if v_old_role = 'owner' then
    select count(*)
    into v_owner_count
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.role = 'owner';

    if v_owner_count <= 1 then
      return query
      select
        false,
        'LAST_OWNER'::text,
        v_old_role,
        v_old_role;

      return;
    end if;
  end if;


  update public.organization_members
  set role = p_new_role
  where id = p_membership_id
    and organization_id = p_organization_id;


  return query
  select
    true,
    'UPDATED'::text,
    v_old_role,
    p_new_role;
end;
$$;


-- =========================================================
-- 2. REMOVE MEMBER
-- =========================================================

create or replace function public.remove_organization_member(
  p_organization_id uuid,
  p_membership_id uuid
)
returns table (
  ok boolean,
  code text,
  removed_user_id uuid,
  previous_role text,
  active_organization_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_locked_organization_id uuid;
  v_user_id uuid;
  v_old_role text;
  v_owner_count bigint;
  v_active_organization_id uuid;
  v_next_organization_id uuid;
begin
  /*
   * StejnĂ˝ organizaÄŤnĂ­ lock jako u zmÄ›ny role.
   */
  select o.id
  into v_locked_organization_id
  from public.organizations o
  where o.id = p_organization_id
  for update;

  if v_locked_organization_id is null then
    return query
    select
      false,
      'ORGANIZATION_NOT_FOUND'::text,
      null::uuid,
      null::text,
      null::uuid;

    return;
  end if;


  /*
   * Target membership musĂ­ bĂ˝t skuteÄŤnÄ› ÄŤlenem
   * tĂ©to konkrĂ©tnĂ­ organizace.
   */
  select
    om.user_id,
    om.role
  into
    v_user_id,
    v_old_role
  from public.organization_members om
  where om.id = p_membership_id
    and om.organization_id = p_organization_id
  for update;

  if v_user_id is null then
    return query
    select
      false,
      'MEMBERSHIP_NOT_FOUND'::text,
      null::uuid,
      null::text,
      null::uuid;

    return;
  end if;


  /*
   * PoslednĂ­ owner nesmĂ­ bĂ˝t odstranÄ›n.
   */
  if v_old_role = 'owner' then
    select count(*)
    into v_owner_count
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.role = 'owner';

    if v_owner_count <= 1 then
      return query
      select
        false,
        'LAST_OWNER'::text,
        v_user_id,
        v_old_role,
        p_organization_id;

      return;
    end if;
  end if;


  /*
   * ZjistĂ­me souÄŤasnou aktivnĂ­ organizaci cĂ­lovĂ©ho uĹľivatele.
   */
  select p.active_organization_id
  into v_active_organization_id
  from public.profiles p
  where p.id = v_user_id
  for update;


  /*
   * Membership smaĹľeme aĹľ po vĹˇech bezpeÄŤnostnĂ­ch kontrolĂˇch.
   */
  delete from public.organization_members
  where id = p_membership_id
    and organization_id = p_organization_id;


  /*
   * Pokud odebranĂˇ organizace nebyla aktivnĂ­,
   * profil nenĂ­ potĹ™eba mÄ›nit.
   */
  if v_active_organization_id is distinct from p_organization_id then
    return query
    select
      true,
      'REMOVED'::text,
      v_user_id,
      v_old_role,
      v_active_organization_id;

    return;
  end if;


  /*
   * Pokud uĹľivatel zĹŻstĂˇvĂˇ ÄŤlenem jinĂ© organizace,
   * vybereme deterministicky jednu z nich.
   *
   * Preferujeme owner ÄŤlenstvĂ­, potom admin/member/viewer,
   * nĂˇslednÄ› nejstarĹˇĂ­ organizaci.
   */
  select om.organization_id
  into v_next_organization_id
  from public.organization_members om
  join public.organizations o
    on o.id = om.organization_id
  where om.user_id = v_user_id
  order by
    case om.role
      when 'owner' then 1
      when 'admin' then 2
      when 'member' then 3
      when 'viewer' then 4
      else 5
    end,
    o.created_at asc,
    o.id asc
  limit 1;


  /*
   * Pokud jinĂˇ organizace neexistuje,
   * active_organization_id zĹŻstane NULL.
   */
  update public.profiles
  set active_organization_id = v_next_organization_id
  where id = v_user_id;


  return query
  select
    true,
    'REMOVED'::text,
    v_user_id,
    v_old_role,
    v_next_organization_id;
end;
$$;


-- =========================================================
-- 3. FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.update_organization_member_role(
  uuid,
  uuid,
  text
)
from public, anon, authenticated;

revoke all
on function public.remove_organization_member(
  uuid,
  uuid
)
from public, anon, authenticated;


grant execute
on function public.update_organization_member_role(
  uuid,
  uuid,
  text
)
to service_role;

grant execute
on function public.remove_organization_member(
  uuid,
  uuid
)
to service_role;


commit;
