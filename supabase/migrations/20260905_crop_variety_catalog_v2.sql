create table if not exists public.crop_catalog (
  id bigserial primary key,
  name text not null,
  scientific_name text,
  category text,
  source text,
  source_reference text,
  active boolean not null default true,
  valid_from date,
  valid_to date,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crop_catalog_name_unique
  on public.crop_catalog (lower(name));

create table if not exists public.variety_catalog (
  id bigserial primary key,
  crop_id bigint not null
    references public.crop_catalog(id)
    on delete cascade,
  name text not null,
  registration_country text,
  source text,
  source_reference text,
  active boolean not null default true,
  valid_from date,
  valid_to date,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists variety_catalog_crop_name_unique
  on public.variety_catalog (crop_id, lower(name));

create index if not exists variety_catalog_crop_id_idx
  on public.variety_catalog (crop_id);

alter table public.crop_catalog enable row level security;
alter table public.variety_catalog enable row level security;

drop policy if exists "Authenticated users can view crop catalog"
  on public.crop_catalog;

create policy "Authenticated users can view crop catalog"
  on public.crop_catalog
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can view variety catalog"
  on public.variety_catalog;

create policy "Authenticated users can view variety catalog"
  on public.variety_catalog
  for select
  to authenticated
  using (true);