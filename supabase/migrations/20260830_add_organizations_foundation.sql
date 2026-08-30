begin;

-- =========================================================
-- AEGRIS ORGANIZATIONS / MULTI-USER FOUNDATION
-- Phase 1
--
-- Tato migrace:
-- - vytváří organizations
-- - vytváří organization_members
-- - vytvoří jednu výchozí organizaci pro každý existující profil
-- - přiřadí existujícího uživatele jako ownera
-- - zapíná RLS
-- - authenticated uživatelům povoluje zatím pouze bezpečný SELECT
--
-- Tato migrace ZÁMĚRNĚ:
-- - nemění projects.user_id
-- - nemění současné projects RLS policies
-- - nemění billing
-- - nepovoluje klientům vytvářet/upravovat organizace
-- =========================================================


-- =========================================================
-- 1. ORGANIZATIONS
-- =========================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  created_by uuid
    references auth.users(id)
    on delete set null,

  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_name_length_check
    check (
      char_length(btrim(name)) >= 1
      and char_length(btrim(name)) <= 160
    ),

  constraint organizations_status_check
    check (
      status in (
        'active',
        'suspended',
        'archived'
      )
    )
);


-- =========================================================
-- 2. ORGANIZATION MEMBERS
-- =========================================================

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role text not null default 'member',

  created_at timestamptz not null default now(),

  constraint organization_members_role_check
    check (
      role in (
        'owner',
        'admin',
        'member',
        'viewer'
      )
    ),

  constraint organization_members_unique_member
    unique (organization_id, user_id)
);


-- =========================================================
-- 3. INDEXES
-- =========================================================

create index if not exists
  organizations_created_by_idx
on public.organizations(created_by);


create index if not exists
  organization_members_user_id_idx
on public.organization_members(user_id);


create index if not exists
  organization_members_organization_id_idx
on public.organization_members(organization_id);


create index if not exists
  organization_members_org_role_idx
on public.organization_members(
  organization_id,
  role
);


-- =========================================================
-- 4. BACKFILL EXISTING AEGRIS USERS
--
-- Každý existující profil dostane jednu vlastní organizaci.
-- Zatím ji pojmenujeme "Moje organizace".
-- Později ji uživatel bude moci přejmenovat na farmu / firmu.
-- =========================================================

insert into public.organizations (
  name,
  created_by
)
select
  'Moje organizace',
  p.id
from public.profiles p
where not exists (
  select 1
  from public.organizations o
  where o.created_by = p.id
);


-- =========================================================
-- 5. EXISTING USERS BECOME OWNERS
-- =========================================================

insert into public.organization_members (
  organization_id,
  user_id,
  role
)
select
  o.id,
  o.created_by,
  'owner'
from public.organizations o
where o.created_by is not null
  and not exists (
    select 1
    from public.organization_members om
    where om.organization_id = o.id
      and om.user_id = o.created_by
  );


-- =========================================================
-- 6. RLS
-- =========================================================

alter table public.organizations
  enable row level security;

alter table public.organization_members
  enable row level security;


-- =========================================================
-- 7. SAFE MEMBERSHIP HELPER
--
-- SECURITY DEFINER je zde záměrně:
-- policy na organization_members nemůže bezpečně dotazovat
-- sama sebe bez rizika rekurzivního RLS.
--
-- Funkce pouze odpovídá ano/ne na otázku:
-- "Je aktuální auth.uid() členem této organizace?"
-- =========================================================

create or replace function public.is_organization_member(
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
  );
$$;


revoke all
on function public.is_organization_member(uuid)
from public, anon;

grant execute
on function public.is_organization_member(uuid)
to authenticated;

grant execute
on function public.is_organization_member(uuid)
to service_role;


-- =========================================================
-- 8. POLICIES
--
-- Phase 1:
-- člen organizace může organizaci a její členy pouze ČÍST.
--
-- CREATE / UPDATE / DELETE zatím klientům nepovolujeme.
-- Tyto operace přidáme později přes kontrolované serverové API.
-- =========================================================

drop policy if exists
  "Organization members can read organization"
on public.organizations;

create policy
  "Organization members can read organization"
on public.organizations
for select
to authenticated
using (
  public.is_organization_member(id)
);


drop policy if exists
  "Organization members can read members"
on public.organization_members;

create policy
  "Organization members can read members"
on public.organization_members
for select
to authenticated
using (
  public.is_organization_member(organization_id)
);


-- =========================================================
-- 9. TABLE GRANTS
--
-- authenticated:
-- pouze SELECT
--
-- service_role:
-- serverová administrace organizací
--
-- anon:
-- žádný přístup
-- =========================================================

revoke all
on table public.organizations
from anon, authenticated;

revoke all
on table public.organization_members
from anon, authenticated;


grant select
on table public.organizations
to authenticated;

grant select
on table public.organization_members
to authenticated;


grant select, insert, update, delete
on table public.organizations
to service_role;

grant select, insert, update, delete
on table public.organization_members
to service_role;


commit;