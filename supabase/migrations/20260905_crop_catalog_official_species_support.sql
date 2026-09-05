-- AEGRIS Crop Catalog
-- Support for official ÚKZÚZ species alongside legacy AEGRIS crop groups.

-- Official species can map to an existing agronomic crop profile.
-- Multiple catalog species may therefore point to the same crop profile
-- (for example winter and spring wheat -> Pšenice).
alter table public.crop_catalog
  add column if not exists crop_profile_id bigint
    references public.crop_profiles(id)
    on delete set null;

-- Distinguish legacy AEGRIS crop groups from official species records.
alter table public.crop_catalog
  add column if not exists catalog_kind text
    not null
    default 'legacy';

-- Restrict catalog_kind to known values.
alter table public.crop_catalog
  drop constraint if exists crop_catalog_catalog_kind_check;

alter table public.crop_catalog
  add constraint crop_catalog_catalog_kind_check
    check (catalog_kind in ('legacy', 'official_species'));

-- The old global name uniqueness prevents e.g. legacy "Kukuřice"
-- and official ÚKZÚZ "kukuřice" from existing side by side.
drop index if exists public.crop_catalog_name_unique;

-- Names remain unique inside each catalog layer.
create unique index if not exists crop_catalog_kind_name_unique
  on public.crop_catalog (catalog_kind, lower(name));

-- Fast lookup from an official species to its agronomic profile.
create index if not exists crop_catalog_crop_profile_id_idx
  on public.crop_catalog (crop_profile_id);

-- Existing rows are the original AEGRIS crop groups.
update public.crop_catalog
set catalog_kind = 'legacy'
where catalog_kind is distinct from 'legacy';