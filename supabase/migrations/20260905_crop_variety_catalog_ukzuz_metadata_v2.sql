alter table public.crop_catalog
  add column if not exists source_valid boolean;

alter table public.variety_catalog
  add column if not exists registration_status_code text,
  add column if not exists source_external_code text,
  add column if not exists legal_effect_date date,
  add column if not exists registration_extended_date date,
  add column if not exists registration_cancelled_date date,
  add column if not exists registration_runoff_date date,
  add column if not exists plant_variety_rights boolean;

create index if not exists variety_catalog_registration_status_code_idx
  on public.variety_catalog (registration_status_code);

create index if not exists variety_catalog_source_external_code_idx
  on public.variety_catalog (source_external_code);