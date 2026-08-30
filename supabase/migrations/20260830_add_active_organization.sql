begin;

-- =========================================================
-- AEGRIS ORGANIZATIONS / MULTI-USER
-- Phase 3: Active organization on profile
--
-- Tato migrace:
-- - přidá active_organization_id do profiles
-- - vytvoří FK na organizations
-- - vytvoří index
-- - nastaví současným profilům jejich existující organizaci
-- - ověří, že aktivní organizace odpovídá skutečnému členství
--
-- Záměrně zatím:
-- - nedává active_organization_id NOT NULL
-- - nemění současné RLS na profiles
-- - nepovoluje klientovi aktivní organizaci přímo měnit
--
-- NOT NULL přidáme až po úpravě signup / organization flow.
-- =========================================================


-- =========================================================
-- 1. ADD ACTIVE ORGANIZATION
-- =========================================================

alter table public.profiles
add column if not exists active_organization_id uuid;


-- =========================================================
-- 2. FOREIGN KEY
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_active_organization_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_active_organization_id_fkey
      foreign key (active_organization_id)
      references public.organizations(id)
      on delete set null
      on update no action;
  end if;
end
$$;


-- =========================================================
-- 3. INDEX
-- =========================================================

create index if not exists
  profiles_active_organization_id_idx
on public.profiles(active_organization_id);


-- =========================================================
-- 4. BACKFILL EXISTING PROFILES
--
-- Každému současnému uživateli nastavíme jeho současnou
-- owner organizaci jako aktivní organizaci.
--
-- Korelovaný subquery + LIMIT 1 zajišťuje deterministické chování,
-- i kdyby uživatel v budoucnu vlastnil více organizací.
-- =========================================================

update public.profiles p
set active_organization_id = (
  select om.organization_id
  from public.organization_members om
  join public.organizations o
    on o.id = om.organization_id
  where om.user_id = p.id
    and om.role = 'owner'
  order by o.created_at asc, o.id asc
  limit 1
)
where p.active_organization_id is null;


-- =========================================================
-- 5. SAFETY CHECK - EXISTING PROFILES
--
-- Všechny současné profily musí mít po backfillu
-- aktivní organizaci.
-- =========================================================

do $$
declare
  v_missing_count bigint;
begin
  select count(*)
  into v_missing_count
  from public.profiles
  where active_organization_id is null;

  if v_missing_count > 0 then
    raise exception
      'AEGRIS migration aborted: % existing profile(s) have no active organization',
      v_missing_count;
  end if;
end
$$;


-- =========================================================
-- 6. SAFETY CHECK - MEMBERSHIP
--
-- Aktivní organizace uživatele musí být organizace,
-- ve které je tento uživatel skutečně členem.
-- =========================================================

do $$
declare
  v_invalid_count bigint;
begin
  select count(*)
  into v_invalid_count
  from public.profiles p
  where p.active_organization_id is not null
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = p.active_organization_id
        and om.user_id = p.id
    );

  if v_invalid_count > 0 then
    raise exception
      'AEGRIS migration aborted: % profile(s) have active organization without membership',
      v_invalid_count;
  end if;
end
$$;


-- =========================================================
-- 7. IMPORTANT
--
-- active_organization_id zatím necháváme NULLABLE.
--
-- Důvod:
-- nový signup dnes ještě automaticky:
--   1. nevytvoří organizaci,
--   2. nevytvoří owner membership,
--   3. nenastaví active_organization_id.
--
-- To doplníme v další fázi.
-- =========================================================


commit;