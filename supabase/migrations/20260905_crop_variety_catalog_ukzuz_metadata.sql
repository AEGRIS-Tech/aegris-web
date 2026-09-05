alter table public.crop_catalog
  add column if not exists external_code text,
  add column if not exists source_system text,
  add column if not exists source_status text;

alter table public.variety_catalog
  add column if not exists external_code text,
  add column if not exists external_crop_code text,
  add column if not exists registration_status text,
  add column if not exists registration_number text,
  add column if not exists registration_date date,
  add column if not exists registration_end_date date,
  add column if not exists source_system text;

create unique index if not exists crop_catalog_source_external_code_unique
  on public.crop_catalog (source_system, external_code)
  where external_code is not null;

create unique index if not exists variety_catalog_source_external_code_unique
  on public.variety_catalog (source_system, external_code)
  where external_code is not null;

create index if not exists variety_catalog_external_crop_code_idx
  on public.variety_catalog (external_crop_code);

create index if not exists variety_catalog_registration_status_idx
  on public.variety_catalog (registration_status);