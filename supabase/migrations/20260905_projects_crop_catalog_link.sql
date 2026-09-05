-- AEGRIS: authoritative project -> official crop catalog relation
-- Existing projects.crop_name remains for backwards compatibility
-- and as a human-readable snapshot.

begin;

alter table public.projects
  add column if not exists crop_catalog_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_crop_catalog_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_crop_catalog_id_fkey
      foreign key (crop_catalog_id)
      references public.crop_catalog(id)
      on delete set null;
  end if;
end $$;

create index if not exists projects_crop_catalog_id_idx
  on public.projects (crop_catalog_id);

comment on column public.projects.crop_catalog_id is
  'Authoritative reference to crop_catalog. crop_name is retained as a human-readable/backwards-compatible snapshot.';

commit;
