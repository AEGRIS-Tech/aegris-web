begin;

-- ---------------------------------------------------------
-- projects -> official variety_catalog
-- ---------------------------------------------------------

alter table public.projects
  add column if not exists variety_catalog_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_variety_catalog_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_variety_catalog_id_fkey
      foreign key (variety_catalog_id)
      references public.variety_catalog(id)
      on delete set null;
  end if;
end
$$;

create index if not exists projects_variety_catalog_id_idx
  on public.projects(variety_catalog_id);

-- ---------------------------------------------------------
-- Browser read access: official crop catalogue
-- ---------------------------------------------------------

grant select on table public.crop_catalog to authenticated;

alter table public.crop_catalog
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'crop_catalog'
      and policyname = 'crop_catalog_authenticated_select'
  ) then
    create policy crop_catalog_authenticated_select
      on public.crop_catalog
      for select
      to authenticated
      using (true);
  end if;
end
$$;

-- ---------------------------------------------------------
-- Browser read access: official variety catalogue
-- ---------------------------------------------------------

grant select on table public.variety_catalog to authenticated;

alter table public.variety_catalog
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'variety_catalog'
      and policyname = 'variety_catalog_authenticated_select'
  ) then
    create policy variety_catalog_authenticated_select
      on public.variety_catalog
      for select
      to authenticated
      using (true);
  end if;
end
$$;

commit;
