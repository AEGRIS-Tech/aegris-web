drop index if exists public.crop_catalog_kind_name_unique;

create index if not exists crop_catalog_kind_name_idx
  on public.crop_catalog (catalog_kind, lower(name));