begin;

-- =========================================================
-- AEGRIS ORGANIZATIONS / MULTI-USER
-- Phase 4: Organization-aware project RLS
--
-- Role model:
-- owner  = full access
-- admin  = full project access
-- member = read + normal project work
-- viewer = read only
--
-- user_id on projects remains the original creator.
-- organization_id is the tenant boundary.
-- =========================================================


-- =========================================================
-- 1. ROLE-AWARE ORGANIZATION HELPER
-- =========================================================

create or replace function public.has_organization_role(
  p_organization_id uuid,
  p_roles text[]
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
      and om.role = any(p_roles)
  );
$$;

revoke all
on function public.has_organization_role(uuid, text[])
from public, anon;

grant execute
on function public.has_organization_role(uuid, text[])
to authenticated, service_role;


-- =========================================================
-- 2. PROTECT PROJECT TENANT KEYS
--
-- Authenticated users must not change:
-- - user_id
-- - organization_id
--
-- These fields define creator + tenant ownership.
-- Service-role operations remain unaffected.
-- =========================================================

create or replace function public.protect_project_tenant_keys()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.role() = 'authenticated' then
    if new.user_id is distinct from old.user_id then
      raise exception
        'Changing projects.user_id is not allowed';
    end if;

    if new.organization_id is distinct from old.organization_id then
      raise exception
        'Changing projects.organization_id is not allowed';
    end if;
  end if;

  return new;
end;
$$;

revoke all
on function public.protect_project_tenant_keys()
from public, anon, authenticated, service_role;

drop trigger if exists projects_protect_tenant_keys
on public.projects;

create trigger projects_protect_tenant_keys
before update
on public.projects
for each row
execute function public.protect_project_tenant_keys();


-- =========================================================
-- 3. PROJECTS
-- =========================================================

drop policy if exists
  "Users can manage own projects"
on public.projects;


-- READ:
-- Every member of the organization may see its projects.
create policy "Organization members can view projects"
on public.projects
for select
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'member', 'viewer']::text[]
  )
);


-- INSERT:
-- owner/admin/member can create a project.
-- user_id must always be the authenticated creator.
create policy "Organization members can create projects"
on public.projects
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'member']::text[]
  )
);


-- UPDATE:
-- owner/admin/member may update project data.
-- Trigger above prevents tenant/creator reassignment.
create policy "Organization members can update projects"
on public.projects
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'member']::text[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'member']::text[]
  )
);


-- DELETE:
-- destructive action only owner/admin.
create policy "Organization admins can delete projects"
on public.projects
for delete
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin']::text[]
  )
);


-- =========================================================
-- 4. ANALYSIS
-- =========================================================

drop policy if exists
  "Allow authenticated select analysis"
on public.analysis;

create policy "Organization members can view analysis"
on public.analysis
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = analysis.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member', 'viewer']::text[]
      )
  )
);


-- =========================================================
-- 5. NDVI HISTORY
-- =========================================================

drop policy if exists
  "Users can read own NDVI history"
on public.ndvi_history;

create policy "Organization members can view NDVI history"
on public.ndvi_history
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = ndvi_history.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member', 'viewer']::text[]
      )
  )
);


-- =========================================================
-- 6. AEGRIS ALERTS
-- =========================================================

drop policy if exists
  "Users can view own AEGRIS alerts"
on public.aegris_alerts;

create policy "Organization members can view AEGRIS alerts"
on public.aegris_alerts
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = aegris_alerts.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member', 'viewer']::text[]
      )
  )
);


-- =========================================================
-- 7. AEGRIS RECOMMENDATIONS
-- =========================================================

drop policy if exists
  "Users can view own AEGRIS recommendations"
on public.aegris_recommendations;

create policy "Organization members can view AEGRIS recommendations"
on public.aegris_recommendations
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = aegris_recommendations.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member', 'viewer']::text[]
      )
  )
);


-- =========================================================
-- 8. PROJECT SOIL PROFILES
-- =========================================================

drop policy if exists
  "Users can view soil profiles of their projects"
on public.project_soil_profiles;

drop policy if exists
  "Users can insert soil profiles for their projects"
on public.project_soil_profiles;

drop policy if exists
  "Users can update soil profiles of their projects"
on public.project_soil_profiles;

drop policy if exists
  "Users can delete soil profiles of their projects"
on public.project_soil_profiles;


-- READ: all organization members including viewer.
create policy "Organization members can view soil profiles"
on public.project_soil_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_soil_profiles.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member', 'viewer']::text[]
      )
  )
);


-- INSERT: owner/admin/member.
create policy "Organization members can create soil profiles"
on public.project_soil_profiles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_soil_profiles.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member']::text[]
      )
  )
);


-- UPDATE: owner/admin/member.
create policy "Organization members can update soil profiles"
on public.project_soil_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_soil_profiles.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member']::text[]
      )
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_soil_profiles.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member']::text[]
      )
  )
);


-- DELETE:
-- soil profile is project working data, so member may delete it too.
create policy "Organization members can delete soil profiles"
on public.project_soil_profiles
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_soil_profiles.project_id
      and public.has_organization_role(
        p.organization_id,
        array['owner', 'admin', 'member']::text[]
      )
  )
);


commit;