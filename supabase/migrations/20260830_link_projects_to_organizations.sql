begin;

-- =========================================================
-- AEGRIS ORGANIZATIONS / MULTI-USER
-- Phase 2: Link projects to organizations
--
-- Tato migrace:
-- - přidá organization_id do projects
-- - vytvoří FK na organizations
-- - vytvoří index
-- - přiřadí existující projekty k organizaci jejich vlastníka
-- - ověří, že žádný existující projekt nezůstal bez organizace
--
-- Záměrně zatím:
-- - nemaže projects.user_id
-- - nemění projects.user_id
-- - nemění současné projects RLS policies
-- - nepřepíná aplikaci na organization-based access
-- =========================================================


-- =========================================================
-- 1. ADD ORGANIZATION_ID
-- =========================================================

alter table public.projects
add column if not exists organization_id uuid;


-- =========================================================
-- 2. FOREIGN KEY
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_organization_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_organization_id_fkey
      foreign key (organization_id)
      references public.organizations(id)
      on delete restrict
      on update no action;
  end if;
end
$$;


-- =========================================================
-- 3. INDEX
-- =========================================================

create index if not exists
  projects_organization_id_idx
on public.projects(organization_id);


-- =========================================================
-- 4. BACKFILL EXISTING PROJECTS
--
-- Každý současný projekt dostane organizaci vytvořenou
-- pro jeho současného user_id.
-- =========================================================

update public.projects p
set organization_id = o.id
from public.organizations o
where p.organization_id is null
  and p.user_id is not null
  and o.created_by = p.user_id;


-- =========================================================
-- 5. SAFETY CHECK
--
-- Pokud by existoval projekt bez organization_id,
-- celá transakce se ukončí chybou a rollbackne.
-- =========================================================

do $$
declare
  v_missing_count bigint;
begin
  select count(*)
  into v_missing_count
  from public.projects
  where organization_id is null;

  if v_missing_count > 0 then
    raise exception
      'AEGRIS migration aborted: % project(s) have no organization_id',
      v_missing_count;
  end if;
end
$$;


-- =========================================================
-- 6. MAKE ORGANIZATION_ID REQUIRED
--
-- Safety check výše zaručuje, že současná data jsou vyplněná.
--
-- Pozor:
-- současný frontend ještě při INSERTu organization_id neposílá.
-- Proto sloupec zatím NEPŘEPÍNÁME na NOT NULL.
--
-- NOT NULL přidáme až po úpravě create-project flow.
-- =========================================================


commit;