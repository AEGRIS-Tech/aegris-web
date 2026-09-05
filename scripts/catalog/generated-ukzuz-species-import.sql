-- Generated from official ÚKZÚZ OOS_CIS01D species catalogue.
-- Do not edit generated rows manually.
begin;

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice setá ozimá',
  'Triticum aestivum L. subsp. aestivum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:1',
  true,
  '2007-09-24',
  null,
  now(),
  '1',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'oves nahý',
  'Avena nuda L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:10',
  true,
  '2007-09-24',
  null,
  now(),
  '10',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chřest',
  'Asparagus officinalis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:100',
  true,
  '2007-09-24',
  null,
  now(),
  '100',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kadeřávek',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:101',
  true,
  '2007-09-24',
  null,
  now(),
  '101',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice setá x pšenice indická kulatozrnná',
  'Triticum aestivum L. subsp. aestivum x Triticum aestivum L. subsp. sphaerococcum (Percival) Mackey',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:102',
  true,
  '2024-11-27',
  null,
  now(),
  '102',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika - hybrid druhů Capsicum annuum a Capsicum chinense',
  'Capsicum annuum L. x Capsicum chinense Jacq.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:103',
  true,
  '2026-01-26',
  null,
  now(),
  '103',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rajče - hybrid druhů Solanum lycopersicum a Solanum habrochaites',
  'Solanum lycopersicum L. x Solanum habrochaites S. Knapp & D.M. Spooner',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:104',
  true,
  '2026-01-26',
  null,
  now(),
  '104',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopr',
  'Anethum graveolens L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:105',
  true,
  '2007-09-24',
  null,
  now(),
  '105',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozlíček polníček',
  'Valerianella locusta (L.) Laterr.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:106',
  true,
  '2007-09-24',
  null,
  now(),
  '106',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kukuřice cukrová',
  'Zea mays L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:107',
  true,
  '2007-09-24',
  null,
  now(),
  '107',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kukuřice pukancová',
  'Zea mays L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:108',
  true,
  '2007-09-24',
  null,
  now(),
  '108',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'květák',
  'Brassica oleracea L. convar. botrytis (L.) Alef. var. botrytis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:109',
  true,
  '2007-09-24',
  null,
  now(),
  '109',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'proso seté',
  'Panicum miliaceum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:11',
  true,
  '2007-09-24',
  null,
  now(),
  '11',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lilek vejcoplodý',
  'Solanum melongena L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:110',
  true,
  '2007-09-24',
  null,
  now(),
  '110',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mangold',
  'Beta vulgaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:111',
  true,
  '2007-09-24',
  null,
  now(),
  '111',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'meloun cukrový',
  'Cucumis melo L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:112',
  true,
  '2007-09-24',
  null,
  now(),
  '112',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'meloun vodní',
  'Citrullus lanatus (Thunb.) Matsum . et Nakai',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:113',
  true,
  '2007-09-24',
  null,
  now(),
  '113',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'okurka nakládačka',
  'Cucumis sativus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:115',
  true,
  '2007-09-24',
  null,
  now(),
  '115',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'okurka salátová',
  'Cucumis sativus  L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:116',
  true,
  '2007-09-24',
  null,
  now(),
  '116',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'okurka skleníková',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:117',
  true,
  '2007-09-24',
  null,
  now(),
  '117',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika',
  'Capsicum annuum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:118',
  true,
  '2007-09-24',
  null,
  now(),
  '118',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'NEPOUŽÍVAT paprika třešňová',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:119',
  true,
  '2007-09-24',
  null,
  now(),
  '119',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pohanka obecná',
  'Fagopyrum esculentum Moench',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:12',
  true,
  '2007-09-24',
  null,
  now(),
  '12',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zelí pekingské',
  'Brassica rapa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:122',
  true,
  '2007-09-24',
  null,
  now(),
  '122',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'petržel kořenová',
  'Petroselinum crispum (Miller) Nyman',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:124',
  true,
  '2007-09-24',
  null,
  now(),
  '124',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mrkev',
  'Daucus  carota L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:126',
  true,
  '2007-09-24',
  null,
  now(),
  '126',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'petržel naťová',
  'Petroselinum crispum (Miller)Nyman ex.A.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:128',
  true,
  '2007-09-24',
  null,
  now(),
  '128',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kapusta hlávková',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:129',
  true,
  '2007-09-24',
  null,
  now(),
  '129',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kukuřice',
  'Zea mays L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:13',
  true,
  '2007-09-24',
  null,
  now(),
  '13',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kapusta růžičková',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:130',
  true,
  '2007-09-24',
  null,
  now(),
  '130',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kapusta hlávková ozimá',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:131',
  true,
  '2007-09-24',
  null,
  now(),
  '131',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pastinák',
  'Pastinaca sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:132',
  true,
  '2007-09-24',
  null,
  now(),
  '132',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pažitka',
  'Allium schoenoprasum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:133',
  true,
  '2007-09-24',
  null,
  now(),
  '133',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lnička setá',
  'Camelina sativa L.Crantz.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:134',
  true,
  '2007-09-24',
  null,
  now(),
  '134',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pór',
  'Allium porrum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:135',
  true,
  '2007-09-24',
  null,
  now(),
  '135',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rajče',
  'Solanum lycopersicum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:136',
  true,
  '2007-09-24',
  null,
  now(),
  '136',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rajče.',
  'Solanum lycopersicum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:137',
  true,
  '2007-09-24',
  null,
  now(),
  '137',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'reveň',
  'Rheum  rhabarbarum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:138',
  true,
  '2007-09-24',
  null,
  now(),
  '138',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ředkev',
  'Raphanus sativus L. var. niger (Mill.) S. Kerner',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:139',
  true,
  '2007-09-24',
  null,
  now(),
  '139',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bob polní',
  'Vicia faba L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:14',
  true,
  '2007-09-24',
  null,
  now(),
  '14',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ředkvička',
  'Raphanus sativus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:140',
  true,
  '2007-09-24',
  null,
  now(),
  '140',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepa salátová',
  'Beta vulgaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:142',
  true,
  '2007-09-24',
  null,
  now(),
  '142',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řeřicha setá',
  'Lepidium sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:143',
  true,
  '2007-09-24',
  null,
  now(),
  '143',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'špenát setý',
  'Spinacia oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:148',
  true,
  '2007-09-24',
  null,
  now(),
  '148',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev setá',
  'Vicia sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:149',
  true,
  '2007-09-24',
  null,
  now(),
  '149',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čočka jedlá',
  'Lens culinaris Medik.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:15',
  true,
  '2007-09-24',
  null,
  now(),
  '15',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'endivie',
  'Cichorium endivia L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:150',
  true,
  '2007-09-24',
  null,
  now(),
  '150',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lagenárie',
  'Lagenaria siceraria (Molina) Standl.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:151',
  true,
  '2025-02-24',
  null,
  now(),
  '151',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tuřín',
  'Brassica napus L.var.napobrassica(L.)Rchb.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:152',
  true,
  '2007-09-24',
  null,
  now(),
  '152',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tykev fíkolistá',
  'Cucurbita  ficifolia C.Bouché',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:153',
  true,
  '2007-09-24',
  null,
  now(),
  '153',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tykev velkoplodá',
  'Cucurbita maxima Duchesne',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:154',
  true,
  '2007-09-24',
  null,
  now(),
  '154',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vodnice',
  'Brassica rapa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:159',
  true,
  '2007-09-24',
  null,
  now(),
  '159',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'fazol obecný',
  'Phaseolus vulgaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:16',
  true,
  '2007-09-24',
  null,
  now(),
  '16',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'fazol šarlatový',
  'Phaseolus coccineus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:160',
  true,
  '2025-11-20',
  null,
  now(),
  '160',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zelí hlávkové bílé',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:161',
  true,
  '2007-09-24',
  null,
  now(),
  '161',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'fazol obecný keříčkový',
  'Phaseolus vulgaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:162',
  true,
  '2007-09-24',
  null,
  now(),
  '162',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'fazol obecný pnoucí',
  'Phaseolus vulgaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:163',
  true,
  '2007-09-24',
  null,
  now(),
  '163',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrách zahradní dřeňový',
  'Pisum sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:164',
  true,
  '2007-09-24',
  null,
  now(),
  '164',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'česnek',
  'Allium sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:165',
  true,
  '2007-09-24',
  null,
  now(),
  '165',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'česnek jarní',
  'Allium sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:167',
  true,
  '2007-09-24',
  null,
  now(),
  '167',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'křen',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:169',
  true,
  '2007-09-24',
  null,
  now(),
  '169',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrách polní jarní',
  'Pisum sativum L. (partim)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:17',
  true,
  '2007-09-24',
  null,
  now(),
  '17',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kmín',
  'Carum carvi L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:170',
  true,
  '2007-09-24',
  null,
  now(),
  '170',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'anýz',
  'Pimpinella anisum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:171',
  true,
  '2007-09-24',
  null,
  now(),
  '171',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'koriandr setý',
  'Coriandrum sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:172',
  true,
  '2007-09-24',
  null,
  now(),
  '172',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'fenykl',
  'Foeniculum vulgare Mill.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:173',
  true,
  '2007-09-24',
  null,
  now(),
  '173',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'majoránka',
  'Origanum majorana L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:174',
  true,
  '2007-09-24',
  null,
  now(),
  '174',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jahodník měsíční',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:175',
  true,
  '2007-09-24',
  null,
  now(),
  '175',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'NEPOUŽÍVAT paprika kořeninová',
  'Capsicum annuum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:176',
  true,
  '2007-09-24',
  null,
  now(),
  '176',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Ageratum houstonianum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:177',
  true,
  '2007-09-24',
  null,
  now(),
  '177',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Agrostis nebulosa',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:178',
  true,
  '2007-09-24',
  null,
  now(),
  '178',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'laskavec ocasatý',
  'Amaranthus caudatus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:179',
  true,
  '2007-09-24',
  null,
  now(),
  '179',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'peluška jarní',
  'Pisum sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:18',
  true,
  '2007-09-24',
  null,
  now(),
  '18',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Amberboa moschata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:180',
  true,
  '2007-09-24',
  null,
  now(),
  '180',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Ammobium alatum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:181',
  true,
  '2007-09-24',
  null,
  now(),
  '181',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hledík větší',
  'Antirrhinum majus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:182',
  true,
  '2007-09-24',
  null,
  now(),
  '182',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Brachycome iberidifolia',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:183',
  true,
  '2007-09-24',
  null,
  now(),
  '183',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Calendula officinalis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:184',
  true,
  '2007-09-24',
  null,
  now(),
  '184',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'astra čínská',
  'Callistephus chinensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:185',
  true,
  '2007-09-24',
  null,
  now(),
  '185',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'nevadlec hřebenitý',
  'Celosia argentea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:186',
  true,
  '2007-09-24',
  null,
  now(),
  '186',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Centaurea americana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:187',
  true,
  '2007-09-24',
  null,
  now(),
  '187',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Centaurea imperialis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:188',
  true,
  '2007-09-24',
  null,
  now(),
  '188',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Clarkia unquiculata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:189',
  true,
  '2007-09-24',
  null,
  now(),
  '189',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev huňatá',
  'Vicia villosa Roth',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:19',
  true,
  '2007-09-24',
  null,
  now(),
  '19',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cleome hassleriana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:190',
  true,
  '2007-09-24',
  null,
  now(),
  '190',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Consolida ambigua',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:191',
  true,
  '2007-09-24',
  null,
  now(),
  '191',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ostrožka stračka',
  'Consolida regalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:192',
  true,
  '2007-09-24',
  null,
  now(),
  '192',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svlačec trojbarevný',
  'Convolvulus tricolor',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:193',
  true,
  '2007-09-24',
  null,
  now(),
  '193',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'krásnoočko různolisté',
  'Coreopsis basalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:194',
  true,
  '2007-09-24',
  null,
  now(),
  '194',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'krásnoočko barevné',
  'Coreopsis tinctoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:195',
  true,
  '2007-09-24',
  null,
  now(),
  '195',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'krásenka zpeřená',
  'Cosmos bipinnatus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:196',
  true,
  '2007-09-24',
  null,
  now(),
  '196',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cosmos sulphureus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:197',
  true,
  '2007-09-24',
  null,
  now(),
  '197',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cynoglossum amabile',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:198',
  true,
  '2007-09-24',
  null,
  now(),
  '198',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jiřinka promněnlivá',
  'Dahlia pinnata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:199',
  true,
  '2007-09-24',
  null,
  now(),
  '199',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice tvrdá ozimá',
  'Triticum turgidum L. subsp. durum (Desf.) van Slageren',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:2',
  true,
  '2007-09-24',
  null,
  now(),
  '2',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev panonská',
  'Vicia pannonica Crantz',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:20',
  true,
  '2007-09-24',
  null,
  now(),
  '20',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dianthus caryophyllus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:200',
  true,
  '2007-09-24',
  null,
  now(),
  '200',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdík čínský',
  'Dianthus chinensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:201',
  true,
  '2007-09-24',
  null,
  now(),
  '201',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Diascia barbarae',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:202',
  true,
  '2007-09-24',
  null,
  now(),
  '202',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dimorphotheca sinuata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:203',
  true,
  '2007-09-24',
  null,
  now(),
  '203',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dolichos lablab',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:204',
  true,
  '2007-09-24',
  null,
  now(),
  '204',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dorotheanthus bellidiformis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:205',
  true,
  '2007-09-24',
  null,
  now(),
  '205',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sluncovka kalifornská',
  'Eschscholtzia californica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:206',
  true,
  '2007-09-24',
  null,
  now(),
  '206',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gaillardia pulchella',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:207',
  true,
  '2007-09-24',
  null,
  now(),
  '207',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gazania rigens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:208',
  true,
  '2007-09-24',
  null,
  now(),
  '208',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Godetia grandiflora',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:209',
  true,
  '2007-09-24',
  null,
  now(),
  '209',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev bengálská',
  'Vicia benghalensis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:21',
  true,
  '2025-01-28',
  null,
  now(),
  '21',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gomphrena haageana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:210',
  true,
  '2007-09-24',
  null,
  now(),
  '210',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šáter ozdobný',
  'Gypsophila elegans',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:211',
  true,
  '2007-09-24',
  null,
  now(),
  '211',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Helenium amarum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:212',
  true,
  '2007-09-24',
  null,
  now(),
  '212',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Helichrysum bracteatum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:214',
  true,
  '2007-09-24',
  null,
  now(),
  '214',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Helipterum humboldtianum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:215',
  true,
  '2007-09-24',
  null,
  now(),
  '215',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Helipterum roseum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:216',
  true,
  '2007-09-24',
  null,
  now(),
  '216',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Kopretina kýlnatá',
  'Chrysanthemum carinatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:217',
  true,
  '2007-09-24',
  null,
  now(),
  '217',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopretina osenní',
  'Chrysanthemum segetum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:218',
  true,
  '2007-09-24',
  null,
  now(),
  '218',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Iberis amara',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:219',
  true,
  '2007-09-24',
  null,
  now(),
  '219',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lupina',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:22',
  true,
  '2007-09-24',
  null,
  now(),
  '22',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'iberka okoličnatá',
  'Iberis umbellata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:220',
  true,
  '2007-09-24',
  null,
  now(),
  '220',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Impatiens balsamina',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:221',
  true,
  '2007-09-24',
  null,
  now(),
  '221',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Kochia scoparia',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:222',
  true,
  '2007-09-24',
  null,
  now(),
  '222',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lagurus ovatus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:223',
  true,
  '2007-09-24',
  null,
  now(),
  '223',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lathyrus odoratus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:224',
  true,
  '2007-09-24',
  null,
  now(),
  '224',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lavatera trimestris',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:225',
  true,
  '2007-09-24',
  null,
  now(),
  '225',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Limonium bonduellei',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:226',
  true,
  '2007-09-24',
  null,
  now(),
  '226',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Limonium sinuatum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:227',
  true,
  '2007-09-24',
  null,
  now(),
  '227',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Limonium sinuatum x Limonium bonduellei',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:228',
  true,
  '2007-09-24',
  null,
  now(),
  '228',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'len velkokvětý',
  'Linum grandiflorum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:229',
  true,
  '2007-09-24',
  null,
  now(),
  '229',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hořčice bílá',
  'Sinapis alba L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:23',
  true,
  '2007-09-24',
  null,
  now(),
  '23',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopretina kalužní',
  'Leucanthemum paludosum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:230',
  true,
  '2007-09-24',
  null,
  now(),
  '230',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lobelia erinus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:231',
  true,
  '2007-09-24',
  null,
  now(),
  '231',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tařicovka přímořská',
  'Lobularia maritima',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:232',
  true,
  '2007-09-24',
  null,
  now(),
  '232',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lonas annua',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:233',
  true,
  '2007-09-24',
  null,
  now(),
  '233',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Malope trifida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:234',
  true,
  '2007-09-24',
  null,
  now(),
  '234',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Matricaria maritima',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:235',
  true,
  '2007-09-24',
  null,
  now(),
  '235',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Matthiola incana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:236',
  true,
  '2007-09-24',
  null,
  now(),
  '236',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Mimulus luteus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:237',
  true,
  '2007-09-24',
  null,
  now(),
  '237',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'nocenka jalapovitá',
  'Mirabilis jalapa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:238',
  true,
  '2007-09-24',
  null,
  now(),
  '238',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Nemesia strumosa',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:239',
  true,
  '2007-09-24',
  null,
  now(),
  '239',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'len olejný',
  'Linum usitatissimum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:24',
  true,
  '2007-09-24',
  null,
  now(),
  '24',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Nemesia versicolor',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:240',
  true,
  '2007-09-24',
  null,
  now(),
  '240',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tabák křídlatý',
  'Nicotiana alata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:241',
  true,
  '2007-09-24',
  null,
  now(),
  '241',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Nicotiana x sanderea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:242',
  true,
  '2007-09-24',
  null,
  now(),
  '242',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Nigella damascena',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:243',
  true,
  '2007-09-24',
  null,
  now(),
  '243',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Ocimum basilicum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:244',
  true,
  '2007-09-24',
  null,
  now(),
  '244',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Panicum capillare',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:245',
  true,
  '2007-09-24',
  null,
  now(),
  '245',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Papaver somniferum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:246',
  true,
  '2007-09-24',
  null,
  now(),
  '246',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Pennisetum villosum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:247',
  true,
  '2007-09-24',
  null,
  now(),
  '247',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Penstemon hartwegii',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:248',
  true,
  '2007-09-24',
  null,
  now(),
  '248',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Phacelia campanularia',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:249',
  true,
  '2007-09-24',
  null,
  now(),
  '249',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mák setý jarní',
  'Papaver somniferum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:25',
  true,
  '2007-09-24',
  null,
  now(),
  '25',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Pharbitis purpurea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:250',
  true,
  '2007-09-24',
  null,
  now(),
  '250',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Phaseolus coccineus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:251',
  true,
  '2007-09-24',
  null,
  now(),
  '251',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Phlox drummondii',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:252',
  true,
  '2007-09-24',
  null,
  now(),
  '252',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Portulaca grandiflora',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:253',
  true,
  '2007-09-24',
  null,
  now(),
  '253',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Psylliostachys suworowii',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:254',
  true,
  '2007-09-24',
  null,
  now(),
  '254',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rýt vonný',
  'Reseda odorata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:255',
  true,
  '2007-09-24',
  null,
  now(),
  '255',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Ricinus communis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:256',
  true,
  '2007-09-24',
  null,
  now(),
  '256',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Rudbeckia hirta',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:257',
  true,
  '2007-09-24',
  null,
  now(),
  '257',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jazylka chobotnatá',
  'Salpiglossis sinuata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:258',
  true,
  '2007-09-24',
  null,
  now(),
  '258',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Salvia farinacea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:259',
  true,
  '2007-09-24',
  null,
  now(),
  '259',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepka ozimá',
  'Brassica napus L. (partim)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:26',
  true,
  '2007-09-24',
  null,
  now(),
  '26',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj luční',
  'Salvia pratensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:260',
  true,
  '2007-09-24',
  null,
  now(),
  '260',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Salvia splendens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:261',
  true,
  '2007-09-24',
  null,
  now(),
  '261',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Salvia viridis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:262',
  true,
  '2007-09-24',
  null,
  now(),
  '262',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Sanvitalia procumbens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:263',
  true,
  '2007-09-24',
  null,
  now(),
  '263',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hlaváč černopurpurový',
  'Scabiosa atropurpurea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:264',
  true,
  '2007-09-24',
  null,
  now(),
  '264',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Scabiosa stellata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:265',
  true,
  '2007-09-24',
  null,
  now(),
  '265',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Schizanthus x wisetonensis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:266',
  true,
  '2007-09-24',
  null,
  now(),
  '266',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Silene coeli - rosa',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:267',
  true,
  '2007-09-24',
  null,
  now(),
  '267',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Silene pendula',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:268',
  true,
  '2007-09-24',
  null,
  now(),
  '268',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'aksamitník vzpřímený',
  'Tagetes erecta',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:269',
  true,
  '2007-09-24',
  null,
  now(),
  '269',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepka jarní',
  'Brassica napus L. (partim)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:27',
  true,
  '2007-09-24',
  null,
  now(),
  '27',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'aksamitník rozkladitý',
  'Tagetes patula',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:270',
  true,
  '2007-09-24',
  null,
  now(),
  '270',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tagetes patula x Tagetes erecta',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:271',
  true,
  '2007-09-24',
  null,
  now(),
  '271',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'aksamitník jemnolistý',
  'Tagetes tenuifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:272',
  true,
  '2007-09-24',
  null,
  now(),
  '272',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řimbaba obecná',
  'Tanacetum parthenium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:273',
  true,
  '2007-09-24',
  null,
  now(),
  '273',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tithonia rotundifolia',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:274',
  true,
  '2007-09-24',
  null,
  now(),
  '274',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tropaeolum majus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:275',
  true,
  '2007-09-24',
  null,
  now(),
  '275',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Ursinia anethoides',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:276',
  true,
  '2007-09-24',
  null,
  now(),
  '276',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Venidium fastuosum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:277',
  true,
  '2007-09-24',
  null,
  now(),
  '277',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Verbena bonariensis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:278',
  true,
  '2007-09-24',
  null,
  now(),
  '278',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Verbena canadensis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:279',
  true,
  '2007-09-24',
  null,
  now(),
  '279',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'slunečnice',
  'Helianthus annuus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:28',
  true,
  '2007-09-24',
  null,
  now(),
  '28',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Verbena x hybrida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:280',
  true,
  '2007-09-24',
  null,
  now(),
  '280',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Verbena rigida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:281',
  true,
  '2007-09-24',
  null,
  now(),
  '281',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Xanthisma texanum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:282',
  true,
  '2007-09-24',
  null,
  now(),
  '282',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'suchokvět roční',
  'Xeranthemum annuum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:283',
  true,
  '2007-09-24',
  null,
  now(),
  '283',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ostálka lepá',
  'Zinnia elegans',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:284',
  true,
  '2007-09-24',
  null,
  now(),
  '284',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ostálka Haagenova',
  'Zinnia haageana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:285',
  true,
  '2007-09-24',
  null,
  now(),
  '285',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Alcea rosea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:286',
  true,
  '2007-09-24',
  null,
  now(),
  '286',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sedmikráska obecná',
  'Bellis perenis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:287',
  true,
  '2007-09-24',
  null,
  now(),
  '287',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Campanula medium',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:288',
  true,
  '2007-09-24',
  null,
  now(),
  '288',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdík bradatý',
  'Dianthus barbatus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:289',
  true,
  '2007-09-24',
  null,
  now(),
  '289',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sója',
  'Glycine max (L.)  Merr.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:29',
  true,
  '2007-09-24',
  null,
  now(),
  '29',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dianthus caryophyllus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:290',
  true,
  '2007-09-24',
  null,
  now(),
  '290',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cheiranthus cheiri',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:291',
  true,
  '2007-09-24',
  null,
  now(),
  '291',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pomněnka lesní',
  'Myosotis sylvatica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:292',
  true,
  '2007-09-24',
  null,
  now(),
  '292',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Senecio bicolor',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:293',
  true,
  '2007-09-24',
  null,
  now(),
  '293',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Viola x wittrockiana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:294',
  true,
  '2007-09-24',
  null,
  now(),
  '294',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Alyssum montanum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:295',
  true,
  '2007-09-24',
  null,
  now(),
  '295',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Alyssum saxatile',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:296',
  true,
  '2007-09-24',
  null,
  now(),
  '296',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Aquilegia x cultorum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:297',
  true,
  '2007-09-24',
  null,
  now(),
  '297',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Aster alpinus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:298',
  true,
  '2007-09-24',
  null,
  now(),
  '298',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvězdnice chlumní',
  'Aster amellus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:299',
  true,
  '2007-09-24',
  null,
  now(),
  '299',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice setá jarní',
  'Triticum aestivum L. subsp. aestivum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:3',
  true,
  '2007-09-24',
  null,
  now(),
  '3',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'len přadný',
  'Linum usitatissimum  L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:30',
  true,
  '2007-09-24',
  null,
  now(),
  '30',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Campanula carpatica',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:300',
  true,
  '2007-09-24',
  null,
  now(),
  '300',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek broskvolistý',
  'Campanula persicifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:301',
  true,
  '2007-09-24',
  null,
  now(),
  '301',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Delphinium x cultorum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:302',
  true,
  '2007-09-24',
  null,
  now(),
  '302',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Digitalis purpurea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:303',
  true,
  '2007-09-24',
  null,
  now(),
  '303',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Echinacea purpurea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:304',
  true,
  '2007-09-24',
  null,
  now(),
  '304',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gaillardia aristata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:305',
  true,
  '2007-09-24',
  null,
  now(),
  '305',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Goniolimon tataricum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:306',
  true,
  '2007-09-24',
  null,
  now(),
  '306',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gypsophila paniculata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:307',
  true,
  '2007-09-24',
  null,
  now(),
  '307',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Heliopsis helianthoides',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:308',
  true,
  '2007-09-24',
  null,
  now(),
  '308',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Heuchera sanquinea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:309',
  true,
  '2007-09-24',
  null,
  now(),
  '309',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel luční',
  'Trifolium pratense L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:31',
  true,
  '2007-09-24',
  null,
  now(),
  '31',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopretina velkokvětá',
  'Leucanthemum maximum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:310',
  true,
  '2007-09-24',
  null,
  now(),
  '310',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Liatris spicata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:311',
  true,
  '2007-09-24',
  null,
  now(),
  '311',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lupinus polyphyllus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:312',
  true,
  '2007-09-24',
  null,
  now(),
  '312',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lychnis chalcedonica',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:313',
  true,
  '2007-09-24',
  null,
  now(),
  '313',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Papaver nudicaule',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:314',
  true,
  '2007-09-24',
  null,
  now(),
  '314',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Penstemon barbatus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:315',
  true,
  '2007-09-24',
  null,
  now(),
  '315',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Rudbeckia hirta',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:316',
  true,
  '2007-09-24',
  null,
  now(),
  '316',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tanacetum coccineum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:317',
  true,
  '2007-09-24',
  null,
  now(),
  '317',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Viola cornuta',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:318',
  true,
  '2007-09-24',
  null,
  now(),
  '318',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula denticulata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:319',
  true,
  '2007-09-24',
  null,
  now(),
  '319',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'prvosenka vyšší',
  'Primula elatior',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:320',
  true,
  '2007-09-24',
  null,
  now(),
  '320',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula x pubescens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:321',
  true,
  '2007-09-24',
  null,
  now(),
  '321',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Asparagus setaceus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:322',
  true,
  '2007-09-24',
  null,
  now(),
  '322',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Asparagus densiflorus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:323',
  true,
  '2007-09-24',
  null,
  now(),
  '323',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Begonia x semperflorens - cultorum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:324',
  true,
  '2007-09-24',
  null,
  now(),
  '324',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Begonia x tuberhybrida - gigantea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:325',
  true,
  '2007-09-24',
  null,
  now(),
  '325',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Begonia x tuberhybrida - multiflora',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:326',
  true,
  '2007-09-24',
  null,
  now(),
  '326',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Begonia x tuberhybrida - pendula',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:327',
  true,
  '2007-09-24',
  null,
  now(),
  '327',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Calceolaria x herbeohybrida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:328',
  true,
  '2007-09-24',
  null,
  now(),
  '328',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Capsicum sp.',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:329',
  true,
  '2007-09-24',
  null,
  now(),
  '329',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel nachový',
  'Trifolium incarnatum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:33',
  true,
  '2007-09-24',
  null,
  now(),
  '33',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Clivia miniata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:330',
  true,
  '2007-09-24',
  null,
  now(),
  '330',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Coleus x blumei',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:331',
  true,
  '2007-09-24',
  null,
  now(),
  '331',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cyclamen persicum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:332',
  true,
  '2007-09-24',
  null,
  now(),
  '332',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Freesia',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:333',
  true,
  '2007-09-24',
  null,
  now(),
  '333',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Pelargonium zonale',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:334',
  true,
  '2007-09-24',
  null,
  now(),
  '334',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Petunia x hybrida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:335',
  true,
  '2007-09-24',
  null,
  now(),
  '335',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula malacoides',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:336',
  true,
  '2007-09-24',
  null,
  now(),
  '336',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula obconica',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:337',
  true,
  '2007-09-24',
  null,
  now(),
  '337',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula praenitens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:338',
  true,
  '2007-09-24',
  null,
  now(),
  '338',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Senecio cruentus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:339',
  true,
  '2007-09-24',
  null,
  now(),
  '339',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel plazivý',
  'Trifolium repens L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:34',
  true,
  '2007-09-24',
  null,
  now(),
  '34',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Sinningia speciosa',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:340',
  true,
  '2007-09-24',
  null,
  now(),
  '340',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Andělika lékařská',
  'Angelica archangelika L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:341',
  true,
  '2007-09-24',
  null,
  now(),
  '341',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Bazalka pravá',
  'Ocimum basilicum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:342',
  true,
  '2007-09-24',
  null,
  now(),
  '342',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'benedikt lékařský',
  'Cnicus benedictus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:343',
  true,
  '2007-09-24',
  null,
  now(),
  '343',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Brutnák lékařský',
  'Borago officinalis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:344',
  true,
  '2007-09-24',
  null,
  now(),
  '344',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Buřina - srdečník',
  'Leonorus cardiaca L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:345',
  true,
  '2007-09-24',
  null,
  now(),
  '345',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'divizna velkokvětá',
  'Verbascum densiflorum Bertol.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:346',
  true,
  '2007-09-24',
  null,
  now(),
  '346',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'dobromysl obecná',
  'Origanum vulgare L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:347',
  true,
  '2007-09-24',
  null,
  now(),
  '347',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'heřmánek pravý',
  'Chamomilla recutica L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:348',
  true,
  '2007-09-24',
  null,
  now(),
  '348',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hořec žlutý',
  'Gentiana lutea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:349',
  true,
  '2007-09-24',
  null,
  now(),
  '349',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel zvrhlý',
  'Trifolium hybridum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:35',
  true,
  '2007-09-24',
  null,
  now(),
  '35',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'heřmánek římský',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:350',
  true,
  '2007-09-24',
  null,
  now(),
  '350',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jablečník obecný',
  'Marrubium vulgare',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:351',
  true,
  '2007-09-24',
  null,
  now(),
  '351',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Jehlice rolní',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:352',
  true,
  '2007-09-24',
  null,
  now(),
  '352',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Jestřabina lékařská',
  'Galega officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:353',
  true,
  '2007-09-24',
  null,
  now(),
  '353',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jitrocel kopinatý',
  'Plantago lanceolata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:354',
  true,
  '2007-09-24',
  null,
  now(),
  '354',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Komonice lékařská',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:355',
  true,
  '2007-09-24',
  null,
  now(),
  '355',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Konopice bledožlutá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:356',
  true,
  '2007-09-24',
  null,
  now(),
  '356',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozlík lékařský',
  'Valeriana collina',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:357',
  true,
  '2007-09-24',
  null,
  now(),
  '357',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'levandule lékařská',
  'Lavandula angustifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:358',
  true,
  '2007-09-24',
  null,
  now(),
  '358',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lékořice lysá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:359',
  true,
  '2007-09-24',
  null,
  now(),
  '359',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'komonice bílá',
  'Melilotus alba Medikus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:36',
  true,
  '2007-09-24',
  null,
  now(),
  '36',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'libeček lékařský',
  'Levisticum officinale',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:360',
  true,
  '2007-09-24',
  null,
  now(),
  '360',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lopuch větší',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:361',
  true,
  '2007-09-24',
  null,
  now(),
  '361',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Máta klasnatá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:362',
  true,
  '2007-09-24',
  null,
  now(),
  '362',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Máta peprná',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:363',
  true,
  '2007-09-24',
  null,
  now(),
  '363',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'meduňka lékařská',
  'Melissa officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:364',
  true,
  '2007-09-24',
  null,
  now(),
  '364',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Medvědice lékařská',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:365',
  true,
  '2007-09-24',
  null,
  now(),
  '365',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'měsíček lékařský',
  'Calendula officinalis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:366',
  true,
  '2007-09-24',
  null,
  now(),
  '366',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mořena barvířská',
  'Rubia tinctorum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:367',
  true,
  '2007-09-24',
  null,
  now(),
  '367',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'náprstník vlnatý',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:368',
  true,
  '2007-09-24',
  null,
  now(),
  '368',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'oman pravý',
  'Inula helenium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:369',
  true,
  '2007-09-24',
  null,
  now(),
  '369',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'štírovník růžkatý',
  'Lotus corniculatus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:37',
  true,
  '2007-09-24',
  null,
  now(),
  '37',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ostropestřec mariánský',
  'Silybum marianum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:370',
  true,
  '2007-09-24',
  null,
  now(),
  '370',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'parcha léčivá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:371',
  true,
  '2007-09-24',
  null,
  now(),
  '371',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pískavice řecké seno',
  'Trigonella foenum-graecum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:372',
  true,
  '2007-09-24',
  null,
  now(),
  '372',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'proskurník lékařský',
  'Alcea officinalis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:373',
  true,
  '2007-09-24',
  null,
  now(),
  '373',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'puškvorec obecný',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:374',
  true,
  '2007-09-24',
  null,
  now(),
  '374',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pelyněk kozalec',
  'Artemisia dracunculus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:375',
  true,
  '2007-09-24',
  null,
  now(),
  '375',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'reveň dlanitá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:376',
  true,
  '2007-09-24',
  null,
  now(),
  '376',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'routa vonná',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:377',
  true,
  '2007-09-24',
  null,
  now(),
  '377',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rulík zlomocný',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:378',
  true,
  '2007-09-24',
  null,
  now(),
  '378',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'proskurník topolovka',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:379',
  true,
  '2007-09-24',
  null,
  now(),
  '379',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'úročník bolhoj',
  'Anthylis vulneraria L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:38',
  true,
  '2007-09-24',
  null,
  now(),
  '38',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'růže šípková',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:380',
  true,
  '2007-09-24',
  null,
  now(),
  '380',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řebříček obecný',
  'Achillea millefolium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:381',
  true,
  '2007-09-24',
  null,
  now(),
  '381',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepík lékařský',
  'Agrimonia eupatoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:382',
  true,
  '2007-09-24',
  null,
  now(),
  '382',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řešetlák počistivý',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:383',
  true,
  '2007-09-24',
  null,
  now(),
  '383',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'saturejka horská (vytrvalá)',
  'Satureja montana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:384',
  true,
  '2007-09-24',
  null,
  now(),
  '384',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'saturejka zahradní',
  'Satureja hortensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:385',
  true,
  '2007-09-24',
  null,
  now(),
  '385',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sléz lesní',
  'Malva sylvestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:386',
  true,
  '2007-09-24',
  null,
  now(),
  '386',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj lékařská',
  'SALVIA OFFICINALIS L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:387',
  true,
  '2007-09-24',
  null,
  now(),
  '387',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'topolovka růžová',
  'Alcea rosea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:388',
  true,
  '2007-09-24',
  null,
  now(),
  '388',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'třezalka tečkovaná',
  'Hypericum perforatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:389',
  true,
  '2007-09-24',
  null,
  now(),
  '389',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vičenec ligrus',
  'Onobrychis viciifolia Scop.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:39',
  true,
  '2007-09-24',
  null,
  now(),
  '39',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tymián obecný',
  'Thymus vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:390',
  true,
  '2007-09-24',
  null,
  now(),
  '390',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'yzop lékařský',
  'Hyssopus officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:391',
  true,
  '2007-09-24',
  null,
  now(),
  '391',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zeměžluč hořká',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:392',
  true,
  '2007-09-24',
  null,
  now(),
  '392',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Bromus lanceolatus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:393',
  true,
  '2007-09-24',
  null,
  now(),
  '393',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dendranthema grandiflora',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:394',
  true,
  '2007-09-24',
  null,
  now(),
  '394',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lewisia cotyledon hybr.',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:395',
  true,
  '2007-09-24',
  null,
  now(),
  '395',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Primula vulgaris',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:396',
  true,
  '2007-09-24',
  null,
  now(),
  '396',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Chrysanthemum multicaule',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:397',
  true,
  '2007-09-24',
  null,
  now(),
  '397',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sléz přeslenitý',
  'Malva verticillata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:398',
  true,
  '2007-09-24',
  null,
  now(),
  '398',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice tvrdá jarní',
  'Triticum turgidum L. subsp. durum (Desf.) van Slageren',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:4',
  true,
  '2007-09-24',
  null,
  now(),
  '4',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vojtěška setá',
  'Medicago sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:40',
  true,
  '2007-09-24',
  null,
  now(),
  '40',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Euphorbia marginata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:400',
  true,
  '2007-09-24',
  null,
  now(),
  '400',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Coreopsis grandiflora',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:401',
  true,
  '2007-09-24',
  null,
  now(),
  '401',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lunaria biennis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:403',
  true,
  '2007-09-24',
  null,
  now(),
  '403',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice roční',
  'Poa annua L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:404',
  true,
  '2007-09-24',
  null,
  now(),
  '404',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Lunaria annua',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:406',
  true,
  '2007-09-24',
  null,
  now(),
  '406',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel zvrácený',
  'Trifolium resupinatum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:407',
  true,
  '2007-09-24',
  null,
  now(),
  '407',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tolice dětelová',
  'Medicago lupulina L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:408',
  true,
  '2007-09-24',
  null,
  now(),
  '408',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'světlice barvířská',
  'Carthamus tinctorius L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:409',
  true,
  '2007-09-24',
  null,
  now(),
  '409',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čičorka pestrá',
  'Securigera varia L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:41',
  true,
  '2007-09-24',
  null,
  now(),
  '41',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Pelargonium peltatum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:410',
  true,
  '2007-09-24',
  null,
  now(),
  '410',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'komonice jednoletá',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:411',
  true,
  '2007-09-24',
  null,
  now(),
  '411',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'štírovník jednoletý',
  'Lotus ornithopodioides',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:412',
  true,
  '2007-09-24',
  null,
  now(),
  '412',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'cizrna beraní',
  'Cicer arientinum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:415',
  true,
  '2007-09-24',
  null,
  now(),
  '415',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'celer řapíkatý',
  'Apium graveolens L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:416',
  true,
  '2007-09-24',
  null,
  now(),
  '416',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Limonium sinensis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:417',
  true,
  '2007-09-24',
  null,
  now(),
  '417',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čirok obecný',
  'Sorghum bicolor (L.) Moench subsp. bicolor',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:418',
  true,
  '2007-09-24',
  null,
  now(),
  '418',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tykev obecná',
  'Cucurbita pepo L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:419',
  true,
  '2007-09-24',
  null,
  now(),
  '419',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bojínek hlíznatý',
  'Phleum nodosum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:42',
  true,
  '2007-09-24',
  null,
  now(),
  '42',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zelí čínské',
  'Brassica chinensis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:420',
  true,
  '2007-09-24',
  null,
  now(),
  '420',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'konopí seté',
  'Cannabis sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:421',
  true,
  '2007-09-24',
  null,
  now(),
  '421',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel alexandrijský',
  'Trifolium alexandrinum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:423',
  true,
  '2007-09-24',
  null,
  now(),
  '423',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel prostřední',
  'Trifolium medium L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:424',
  true,
  '2007-09-24',
  null,
  now(),
  '424',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lesknice kanárská',
  'Phalaris canariensis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:425',
  true,
  '2007-09-24',
  null,
  now(),
  '425',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice obecná',
  'Poa trivialis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:426',
  true,
  '2007-09-24',
  null,
  now(),
  '426',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'medyněk vlnatý',
  'Holcus lanatus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:427',
  true,
  '2007-09-24',
  null,
  now(),
  '427',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'psineček veliký',
  'Agrostis gigantea Roth',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:428',
  true,
  '2007-09-24',
  null,
  now(),
  '428',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'psineček psí',
  'Agrostis canina L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:429',
  true,
  '2007-09-24',
  null,
  now(),
  '429',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bojínek luční',
  'Phleum pratense L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:43',
  true,
  '2007-09-24',
  null,
  now(),
  '43',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sveřep bezbranný',
  'Bromus inermis Leyss.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:430',
  true,
  '2007-09-24',
  null,
  now(),
  '430',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pýr hřebenitý',
  'Agropyrum cristatum (L.) Gaerm',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:431',
  true,
  '2007-09-24',
  null,
  now(),
  '431',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čirok súdánská tráva',
  'Sorghum bicolor (L.) Moench subsp. drummondii (Steud.) de Wet ex Davidse',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:432',
  true,
  '2007-09-24',
  null,
  now(),
  '432',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hořčice černá',
  'Brassica nigra  (L.) W.D.J. Koch',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:433',
  true,
  '2007-09-24',
  null,
  now(),
  '433',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lupina žlutá',
  'Lupinus luteus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:434',
  true,
  '2007-09-24',
  null,
  now(),
  '434',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'salát listový',
  'Lactuca sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:435',
  true,
  '2007-09-24',
  null,
  now(),
  '435',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'peluška ozimá',
  'Pisum sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:436',
  true,
  '2007-09-24',
  null,
  now(),
  '436',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrách polní ozimý',
  'Pisum sativum L. (partim)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:437',
  true,
  '2022-09-15',
  null,
  now(),
  '437',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek mnohokvětý x kostřava rákosovitá',
  'xFestulolium Asch. & Graebn.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:438',
  true,
  '2007-09-24',
  null,
  now(),
  '438',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'srha hajní',
  'Dactylis polygama Horv.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:439',
  true,
  '2007-09-24',
  null,
  now(),
  '439',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek hybridní',
  'Lolium x hybridum Hausskn.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:44',
  true,
  '2007-09-24',
  null,
  now(),
  '44',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sveřep horský',
  'Bromus marginatus Nees ex Steud.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:440',
  true,
  '2007-09-24',
  null,
  now(),
  '440',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tykev - hybrid druhů Cucurbita maxima a Cucurbita moschata (podnož)',
  'Cucurbita maxima Duchesne x Cucurbita moschata Duchesne',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:441',
  true,
  '2007-09-24',
  null,
  now(),
  '441',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika okrasná',
  'Capsicum bacatum pendulum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:442',
  true,
  '2007-09-24',
  null,
  now(),
  '442',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Polypogon monspeliensis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:443',
  true,
  '2007-09-24',
  null,
  now(),
  '443',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lupina proměnlivá',
  'Lupinus mutabilis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:444',
  true,
  '2007-09-24',
  null,
  now(),
  '444',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tulipán',
  'Tulipa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:445',
  true,
  '2007-09-24',
  null,
  now(),
  '445',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'salát',
  'Lactuca sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:446',
  true,
  '2007-09-24',
  null,
  now(),
  '446',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tritikale jarní',
  'x Triticosecale Wittm. ex A. Camus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:447',
  true,
  '2007-09-24',
  null,
  now(),
  '447',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kosmídium',
  'Cosmidium burridgeanum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:448',
  true,
  '2007-09-24',
  null,
  now(),
  '448',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Molucella laevis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:449',
  true,
  '2007-09-24',
  null,
  now(),
  '449',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek mnohokvětý (jednoletý)',
  'Lolium multiflorum Lam. ssp.westerwoldicum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:45',
  true,
  '2007-09-24',
  null,
  now(),
  '45',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mečík',
  'Gladiolus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:450',
  true,
  '2007-09-24',
  null,
  now(),
  '450',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice špalda jarní',
  'Triticum aestivum L. subsp. spelta (L.) Thell.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:451',
  true,
  '2022-09-15',
  null,
  now(),
  '451',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mák setý ozimý',
  'Papaver somniferum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:452',
  true,
  '2022-09-15',
  null,
  now(),
  '452',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tomka vonná',
  'Anthoxanthum odoratum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:453',
  true,
  '2007-09-24',
  null,
  now(),
  '453',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice špalda ozimá',
  'Triticum aestivum L. subsp. spelta (L.) Thell.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:454',
  true,
  '2007-09-24',
  null,
  now(),
  '454',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Bidens Aurea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:455',
  true,
  '2007-09-24',
  null,
  now(),
  '455',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Festulolium',
  'xFestulolium Asch. & Graebn.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:456',
  true,
  '2007-09-24',
  null,
  now(),
  '456',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrách zahradní cukrový',
  'Pisum sativum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:457',
  true,
  '2007-09-24',
  null,
  now(),
  '457',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lupina úzkolistá',
  'Lupinus angustifolius L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:458',
  true,
  '2007-09-24',
  null,
  now(),
  '458',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kerblík',
  'Anthriscus cerefolium (L) Hoffm.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:459',
  true,
  '2007-09-24',
  null,
  now(),
  '459',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek mnohokvětý',
  'Lolium multiflorum Lam. ssp. italicum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:46',
  true,
  '2007-09-24',
  null,
  now(),
  '46',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pomněnka alpská',
  'Myosotis alpestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:460',
  true,
  '2007-09-24',
  null,
  now(),
  '460',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Aconitum napellus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:461',
  true,
  '2007-09-24',
  null,
  now(),
  '461',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Physalis',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:462',
  true,
  '2007-09-24',
  null,
  now(),
  '462',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Petunia pendula',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:463',
  true,
  '2007-09-24',
  null,
  now(),
  '463',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Mina lobata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:464',
  true,
  '2007-09-24',
  null,
  now(),
  '464',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Zea japonica',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:465',
  true,
  '2007-09-24',
  null,
  now(),
  '465',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cotula barbata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:466',
  true,
  '2007-09-24',
  null,
  now(),
  '466',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Craspedia globosa',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:467',
  true,
  '2007-09-24',
  null,
  now(),
  '467',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černucha východní',
  'Nigella orientalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:468',
  true,
  '2007-09-24',
  null,
  now(),
  '468',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Brassica oleracea',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:469',
  true,
  '2007-09-24',
  null,
  now(),
  '469',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek vytrvalý',
  'Lolium perenne L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:47',
  true,
  '2007-09-24',
  null,
  now(),
  '47',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Mimulus hybridus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:470',
  true,
  '2007-09-24',
  null,
  now(),
  '470',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Achillea millefolium',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:471',
  true,
  '2007-09-24',
  null,
  now(),
  '471',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Coleus hybrida',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:472',
  true,
  '2007-09-24',
  null,
  now(),
  '472',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Penstemon hybridus',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:473',
  true,
  '2007-09-24',
  null,
  now(),
  '473',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cobaea scandens',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:474',
  true,
  '2007-09-24',
  null,
  now(),
  '474',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Thunbergia alata',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:475',
  true,
  '2007-09-24',
  null,
  now(),
  '475',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Fragaria Vesca',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:476',
  true,
  '2007-09-24',
  null,
  now(),
  '476',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'orlíček obecný (planý)',
  'Aquilegia vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:477',
  true,
  '2007-09-24',
  null,
  now(),
  '477',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Cleome hassleriana',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:478',
  true,
  '2007-09-24',
  null,
  now(),
  '478',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Eupatorium cannabium',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:479',
  true,
  '2007-09-24',
  null,
  now(),
  '479',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava červená',
  'Festuca rubra L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:48',
  true,
  '2007-09-24',
  null,
  now(),
  '48',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Heliotropium',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:480',
  true,
  '2007-09-24',
  null,
  now(),
  '480',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Helichrysum monstrosum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:481',
  true,
  '2007-09-24',
  null,
  now(),
  '481',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jílek mnohokvětý x kostřava luční',
  'xFestulolium Asch. & Graebn.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:482',
  true,
  '2007-09-24',
  null,
  now(),
  '482',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice nízká',
  'Poa supina',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:483',
  true,
  '2007-09-24',
  null,
  now(),
  '483',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'salát římský',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:485',
  true,
  '2007-09-24',
  null,
  now(),
  '485',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zelí hlávkové červené',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:486',
  true,
  '2007-09-24',
  null,
  now(),
  '486',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čekanka salátová hlávková',
  'Cichorium intybus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:487',
  true,
  '2007-09-24',
  null,
  now(),
  '487',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'oves setý ozimý',
  'Avena sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:488',
  true,
  '2022-09-15',
  null,
  now(),
  '488',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čirok x čirok súdánská tráva',
  'Sorghum bicolor (L.) Moench subsp. bicolor x Sorghum bicolor (L.) Moench subsp. drummondii (Steud.) de Wet ex Davidse',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:489',
  true,
  '2007-12-14',
  null,
  now(),
  '489',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava luční',
  'Festuca pratensis Huds.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:49',
  true,
  '2007-09-24',
  null,
  now(),
  '49',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lesknice  vodní',
  'Phalaris aquatica L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:490',
  true,
  '2007-12-14',
  null,
  now(),
  '490',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'broskvoň',
  'Prunus persica (L.) Batsch',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:491',
  true,
  '2008-01-15',
  null,
  now(),
  '491',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrušeň',
  'Pyrus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:492',
  true,
  '2008-01-15',
  null,
  now(),
  '492',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jabloň',
  'Malus Mill.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:493',
  true,
  '2008-01-15',
  null,
  now(),
  '493',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'líska',
  'Corylus avellana L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:494',
  true,
  '2008-01-15',
  null,
  now(),
  '494',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mandloň',
  'Prunus amygdalus Batsch',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:495',
  true,
  '2008-01-15',
  null,
  now(),
  '495',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mahalebka',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:496',
  true,
  '2008-01-15',
  null,
  now(),
  '496',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'myrobalán',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:497',
  true,
  '2008-01-15',
  null,
  now(),
  '497',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'meruňka',
  'Prunus armeniaca L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:498',
  true,
  '2008-01-15',
  null,
  now(),
  '498',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ořešák vlašský',
  'Juglans regia L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:499',
  true,
  '2008-01-15',
  null,
  now(),
  '499',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'žito ozimé',
  'Secale cereale L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:5',
  true,
  '2007-09-24',
  null,
  now(),
  '5',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava ovčí',
  'Festuca ovina L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:50',
  true,
  '2007-09-24',
  null,
  now(),
  '50',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'slivoň',
  'Prunus domeatica L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:500',
  true,
  '2008-01-15',
  null,
  now(),
  '500',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'třešeň',
  'Prunus avium (L.) L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:501',
  true,
  '2008-01-15',
  null,
  now(),
  '501',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika nepoužívat',
  'Capsicum annuum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:502',
  true,
  '2008-06-12',
  null,
  now(),
  '502',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Arctotis hybrida',
  'Arctotis hybrida',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:503',
  true,
  '2008-11-20',
  null,
  now(),
  '503',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Datura metel',
  'Datura metel  L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:504',
  true,
  '2008-11-20',
  null,
  now(),
  '504',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Verbena hybrida',
  'Verbena hybrida L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:505',
  true,
  '2008-11-20',
  null,
  now(),
  '505',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Tradescantia x andersoniana',
  'Tradescantia x andersoniana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:506',
  true,
  '2009-01-19',
  null,
  now(),
  '506',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Aubrieta hybrida',
  'Aubrieta hybrida',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:507',
  true,
  '2009-09-30',
  null,
  now(),
  '507',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Arabis alpina',
  'Arabis alpina',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:508',
  true,
  '2009-09-30',
  null,
  now(),
  '508',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lesknice rákosovitá',
  'Phalaris arundinacea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:509',
  true,
  '2010-02-11',
  null,
  now(),
  '509',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava rákosovitá',
  'Festuca arundinacea Schreb.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:51',
  true,
  '2007-09-24',
  null,
  now(),
  '51',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sveřep sitecký',
  'Bromus sitchensis Trin.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:510',
  true,
  '2010-04-14',
  null,
  now(),
  '510',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'katrán etiopský',
  'Crambe abyssinica Hochst. ex R.E.Fr.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:511',
  true,
  '2012-04-20',
  null,
  now(),
  '511',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'laskavec krvavý',
  'Amaranthus cruentus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:512',
  true,
  '2020-05-18',
  null,
  now(),
  '512',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chmel',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:513',
  true,
  '2020-08-18',
  null,
  now(),
  '513',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'broskvomandloň',
  'Prunus sp.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:514',
  true,
  '2021-11-23',
  null,
  now(),
  '514',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika EHM',
  'Capsicum annuum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:515',
  true,
  '2023-02-22',
  null,
  now(),
  '515',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rajče EHM',
  'Solanum lycopersicum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:516',
  true,
  '2023-02-22',
  null,
  now(),
  '516',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kukuřice EHM',
  'Zea mays L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:517',
  true,
  '2025-03-05',
  null,
  now(),
  '517',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lilek vejcoplodý EHM',
  'Solanum melongena L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:518',
  true,
  '2025-03-05',
  null,
  now(),
  '518',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tritikale ozimé EHM',
  'xTriticosecale Wittm. ex  A. Camus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:519',
  true,
  '2025-03-05',
  null,
  now(),
  '519',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice bahenní',
  'Poa palustris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:52',
  true,
  '2007-09-24',
  null,
  now(),
  '52',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice hajní',
  'Poa nemoralis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:53',
  true,
  '2007-09-24',
  null,
  now(),
  '53',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mastňák habešský',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:530',
  true,
  '2020-05-15',
  null,
  now(),
  '530',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice luční',
  'Poa pratensis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:54',
  true,
  '2007-09-24',
  null,
  now(),
  '54',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice smáčknutá',
  'Poa compressa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:55',
  true,
  '2007-09-24',
  null,
  now(),
  '55',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černucha damašská',
  'Nigella damascena L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:550',
  true,
  '2008-10-08',
  null,
  now(),
  '550',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Yucca filamentosa',
  'Yucca filamentosa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:551',
  true,
  '2008-10-08',
  null,
  now(),
  '551',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Centaurea montana L.',
  'Centaurea montana L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:552',
  true,
  '2008-10-08',
  null,
  now(),
  '552',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Echinops ritro L.',
  'Echinops ritro L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:553',
  true,
  '2008-10-08',
  null,
  now(),
  '553',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Iberis sempervirens L.',
  'Iberis sempervirens L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:554',
  true,
  '2008-10-08',
  null,
  now(),
  '554',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Carlina acaulis L.',
  'Carlina acaulis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:555',
  true,
  '2008-10-13',
  null,
  now(),
  '555',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Chrysanthemum',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:556',
  true,
  '2010-11-02',
  null,
  now(),
  '556',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Calendula Radio',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:557',
  true,
  '2010-11-03',
  null,
  now(),
  '557',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'cibule sečka',
  'Allium fistulosum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:558',
  true,
  '2011-03-30',
  null,
  now(),
  '558',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava drsnolistá',
  'Festuca trachyphylla (Hack.) Hack.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:559',
  true,
  '2011-04-07',
  null,
  now(),
  '559',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'metlice trsnatá',
  'Deschampsia caespitosa(L.) P.Beauv.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:56',
  true,
  '2007-09-24',
  null,
  now(),
  '56',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel luční x jetel prostřední',
  'Trifolium pratense L. x Trifolium medium L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:560',
  true,
  '2013-04-11',
  null,
  now(),
  '560',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'žito jarní',
  'Secale cereale L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:561',
  true,
  '2013-04-17',
  null,
  now(),
  '561',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vojtěška proměnlivá',
  'Medicago x varia T. Martyn',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:562',
  true,
  '2013-05-28',
  null,
  now(),
  '562',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Jestřabina východní',
  'Galega orientalis Lam.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:563',
  true,
  '2013-06-05',
  null,
  now(),
  '563',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice dvouzrnka',
  'Triticum turgidum L. subsp. dicoccum (Schrank ex Schübl.) Thell.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:564',
  true,
  '2015-06-03',
  null,
  now(),
  '564',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice setá x pšenice špalda',
  'Triticum aestivum L. x Triticum spelta L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:565',
  true,
  '2016-05-06',
  null,
  now(),
  '565',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svazenka shloučená',
  'Phacelia congesta Hook.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:566',
  true,
  '2016-11-30',
  null,
  now(),
  '566',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pšenice jednozrnka',
  'Triticum monococcum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:567',
  true,
  '2018-04-19',
  null,
  now(),
  '567',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel kavkazský',
  'Trifolium ambiguum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:568',
  true,
  '2018-04-19',
  null,
  now(),
  '568',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Vigna',
  'Vigna unguiculata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:569',
  true,
  '2019-02-21',
  null,
  now(),
  '569',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ovsík vyvýšený',
  'Arrhenatherum elatius (L.) P.Beauv.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:57',
  true,
  '2007-09-24',
  null,
  now(),
  '57',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Elytrigia elongata',
  'Elytrigia elongata (Host) Nevski',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:570',
  true,
  '2019-08-21',
  null,
  now(),
  '570',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel michelianský',
  'Trifolium michelianum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:571',
  true,
  '2019-09-12',
  null,
  now(),
  '571',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrachor setý',
  'Lathyrus sativus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:572',
  true,
  '2020-09-30',
  null,
  now(),
  '572',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Felicia sp.',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:573',
  true,
  '2020-12-07',
  null,
  now(),
  '573',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel podzemní',
  'Trifolium subterraneum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:574',
  true,
  '2021-03-05',
  null,
  now(),
  '574',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'roketa setá',
  'Eruca sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:575',
  true,
  '2021-09-10',
  null,
  now(),
  '575',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tykev muškátová',
  'Cucurbita moschata Duchesne',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:576',
  true,
  '2021-11-04',
  null,
  now(),
  '576',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'poháňka hřebenitá',
  'Cynosurus cristatus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:58',
  true,
  '2007-09-24',
  null,
  now(),
  '58',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'psárka luční',
  'Alopecurus pratensis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:59',
  true,
  '2007-09-24',
  null,
  now(),
  '59',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ječmen ozimý',
  'Hordeum vulgare L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:6',
  true,
  '2007-09-24',
  null,
  now(),
  '6',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'psineček tenký',
  'Agrostis capillaris L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:60',
  true,
  '2007-09-24',
  null,
  now(),
  '60',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'psineček výběžkatý',
  'Agrostis stolonifera L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:61',
  true,
  '2007-09-24',
  null,
  now(),
  '61',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'srha laločnatá',
  'Dactylis glomerata L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:62',
  true,
  '2007-09-24',
  null,
  now(),
  '62',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Nicotiana tabacum',
  'Nicotiana tabacum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:620',
  true,
  '2012-02-16',
  null,
  now(),
  '620',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'andělika lesní',
  'Angelica sylvestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:621',
  true,
  '2024-03-19',
  null,
  now(),
  '621',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopretina irkutská',
  'Leucanthemum ircutianum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:622',
  true,
  '2024-03-21',
  null,
  now(),
  '622',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek širokolistý',
  'Campanula latifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:623',
  true,
  '2024-03-28',
  null,
  now(),
  '623',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek řepkovitý',
  'Campanula rapunculoides',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:624',
  true,
  '2024-03-28',
  null,
  now(),
  '624',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek okrouhlolistý',
  'Campanula rotundifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:625',
  true,
  '2024-03-28',
  null,
  now(),
  '625',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek kopřivolistý',
  'Campanula trachelium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:626',
  true,
  '2024-03-28',
  null,
  now(),
  '626',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vratič obecný',
  'Tanacetum vulgare',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:627',
  true,
  '2024-03-28',
  null,
  now(),
  '627',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek klubkatý',
  'Campanula glomerata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:628',
  true,
  '2024-03-28',
  null,
  now(),
  '628',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vičenec písečný',
  'Onobrychis arenaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:629',
  true,
  '2024-03-28',
  null,
  now(),
  '629',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'trojštět žlutavý',
  'Trisetum flavescens (L.) P. Beauv.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:63',
  true,
  '2007-09-24',
  null,
  now(),
  '63',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev úzkolistá',
  'Vicia angustifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:630',
  true,
  '2024-03-28',
  null,
  now(),
  '630',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'válečka prapořitá',
  'Brachypodium pinnatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:631',
  true,
  '2024-03-28',
  null,
  now(),
  '631',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'užanka lékařská',
  'Cynoglossum officinale',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:632',
  true,
  '2024-03-28',
  null,
  now(),
  '632',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tužebník obecný',
  'Filipendula vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:633',
  true,
  '2024-03-28',
  null,
  now(),
  '633',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tužebník jilmový',
  'Filipendula ulmaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:634',
  true,
  '2024-03-28',
  null,
  now(),
  '634',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šedivka šedá',
  'Berteroa incana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:635',
  true,
  '2024-03-28',
  null,
  now(),
  '635',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'třezalka skvrnitá',
  'Hypericum maculatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:636',
  true,
  '2024-03-28',
  null,
  now(),
  '636',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'třeslice prostřední',
  'Briza media',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:637',
  true,
  '2024-03-28',
  null,
  now(),
  '637',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'troskut prstnatý',
  'Cynodon dactylon',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:638',
  true,
  '2024-03-28',
  null,
  now(),
  '638',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tolice srpovitá',
  'Medicago falcata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:639',
  true,
  '2024-03-28',
  null,
  now(),
  '639',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mezidruhový hybrid',
  'X FESTULOLIUM',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:64',
  true,
  '2007-09-24',
  null,
  now(),
  '64',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj zahradní',
  'Salvia viridis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:640',
  true,
  '2024-03-28',
  null,
  now(),
  '640',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj šarlatová',
  'Salvia coccinea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:641',
  true,
  '2024-03-28',
  null,
  now(),
  '641',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj přeslenitá',
  'Salvia verticillata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:642',
  true,
  '2024-03-28',
  null,
  now(),
  '642',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šalvěj hajní',
  'Salvia nemorosa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:644',
  true,
  '2024-03-28',
  null,
  now(),
  '644',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svízel syřišťový',
  'Galium verum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:645',
  true,
  '2024-03-28',
  null,
  now(),
  '645',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svízel přítula',
  'Galium aparine',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:646',
  true,
  '2024-03-28',
  null,
  now(),
  '646',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svízel lesní',
  'Galium sylvaticum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:647',
  true,
  '2024-03-28',
  null,
  now(),
  '647',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sveřep vzpřímený',
  'Bromus erectus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:648',
  true,
  '2024-03-28',
  null,
  now(),
  '648',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'strdivka sedmihradská',
  'Melica transsilvanica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:649',
  true,
  '2024-03-28',
  null,
  now(),
  '649',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čirok cukrový',
  'Sorghum saccharatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:65',
  true,
  '2007-09-24',
  null,
  now(),
  '65',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'strdivka brvitá',
  'Melica ciliata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:650',
  true,
  '2024-03-28',
  null,
  now(),
  '650',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'starček vodní',
  'Senecio aquaticus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:651',
  true,
  '2024-03-28',
  null,
  now(),
  '651',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'srpice barvířská',
  'Serratula tinctoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:652',
  true,
  '2024-03-28',
  null,
  now(),
  '652',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'smolnička obecná',
  'Lychnis viscaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:653',
  true,
  '2024-03-29',
  null,
  now(),
  '653',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'smělek štíhlý',
  'Koeleria macrantha',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:654',
  true,
  '2024-03-29',
  null,
  now(),
  '654',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'smělek jehlancovitý',
  'Koeleria pyramidata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:655',
  true,
  '2024-03-29',
  null,
  now(),
  '655',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sléz velkokvětý',
  'Malva alcea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:656',
  true,
  '2024-03-29',
  null,
  now(),
  '656',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sléz pižmový',
  'Malva moschata L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:657',
  true,
  '2024-03-29',
  null,
  now(),
  '657',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sléz maurský',
  'Malva mauritiana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:658',
  true,
  '2024-03-29',
  null,
  now(),
  '658',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'silenka širolistá',
  'Melandrium album',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:659',
  true,
  '2024-03-29',
  null,
  now(),
  '659',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čirok metlový',
  'Sorghum  dochna (Forsskal) Snowden.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:66',
  true,
  '2007-09-24',
  null,
  now(),
  '66',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'silenka nicí',
  'Silene nutans',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:660',
  true,
  '2024-03-29',
  null,
  now(),
  '660',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'silenka nadmutá',
  'Silene vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:661',
  true,
  '2024-03-29',
  null,
  now(),
  '661',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'silenka dvoudomá',
  'Silene dioica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:662',
  true,
  '2024-03-29',
  null,
  now(),
  '662',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'orlíček zkřížený',
  'Aquilegia x hybrida',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:663',
  true,
  '2024-03-29',
  null,
  now(),
  '663',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řimbaba chocholičnatá',
  'Tanacetum corymbosum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:664',
  true,
  '2024-03-29',
  null,
  now(),
  '664',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řeřišnice luční',
  'Cardamine pratensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:665',
  true,
  '2024-03-29',
  null,
  now(),
  '665',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepík vonný',
  'Agrimonia procera',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:666',
  true,
  '2024-03-29',
  null,
  now(),
  '666',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řebříček sličný',
  'Achillea nobilis L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:667',
  true,
  '2024-03-29',
  null,
  now(),
  '667',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řebříček chlumní',
  'Achillea collina',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:668',
  true,
  '2024-03-29',
  null,
  now(),
  '668',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řebříček bertrám',
  'Achillea ptarmica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:669',
  true,
  '2024-03-29',
  null,
  now(),
  '669',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bér italský',
  'Setaria italica (L.) P.Beauv.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:67',
  true,
  '2007-09-24',
  null,
  now(),
  '67',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rýt žlutý',
  'Reseda lutea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:670',
  true,
  '2024-03-29',
  null,
  now(),
  '670',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rožec rolní',
  'Cerastium arvense',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:671',
  true,
  '2024-03-29',
  null,
  now(),
  '671',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rozrazil ožankovitý',
  'Veronica teucrium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:672',
  true,
  '2024-03-29',
  null,
  now(),
  '672',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rozrazil lékařský',
  'Veronica officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:673',
  true,
  '2024-03-29',
  null,
  now(),
  '673',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rozrazil klasnatý',
  'Veronica spicata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:674',
  true,
  '2024-03-29',
  null,
  now(),
  '674',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rozrazil dlouholistý',
  'Veronica longifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:675',
  true,
  '2024-03-29',
  null,
  now(),
  '675',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rmen barvířský',
  'Anthemis tinctoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:676',
  true,
  '2024-03-29',
  null,
  now(),
  '676',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rdesno hadí kořen',
  'Bistorta major',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:677',
  true,
  '2024-03-29',
  null,
  now(),
  '677',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pupalka dvouletá',
  'Oenothera biennis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:678',
  true,
  '2024-03-29',
  null,
  now(),
  '678',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pryšec chvojka',
  'Euphorbia cyparissias',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:679',
  true,
  '2024-03-29',
  null,
  now(),
  '679',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hořčice sareptská',
  'Brassica juncea (L.) Czernj.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:68',
  true,
  '2007-09-24',
  null,
  now(),
  '68',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pryskyřník prudký',
  'Ranunculus acris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:680',
  true,
  '2024-03-29',
  null,
  now(),
  '680',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'prvosenka jarní',
  'Primula veris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:681',
  true,
  '2024-03-29',
  null,
  now(),
  '681',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'prasetník kořenatý',
  'Hypochaeris radicata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:682',
  true,
  '2024-03-29',
  null,
  now(),
  '682',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'povíjnice trojbarevná',
  'Ipomoea tricolor',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:683',
  true,
  '2024-03-29',
  null,
  now(),
  '683',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'podběl lékařský',
  'Tussilago farfara',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:684',
  true,
  '2024-03-29',
  null,
  now(),
  '684',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pilát lékařský',
  'Anchusa officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:685',
  true,
  '2024-03-29',
  null,
  now(),
  '685',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pcháč zelinný',
  'Cirsium oleraceum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:686',
  true,
  '2024-03-29',
  null,
  now(),
  '686',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pcháč různolistý',
  'Cirsium heterophyllum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:687',
  true,
  '2024-03-29',
  null,
  now(),
  '687',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pcháč bezlodyžný',
  'Cirsium acaule',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:688',
  true,
  '2024-03-29',
  null,
  now(),
  '688',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pcháč bělohlavý',
  'Cirsium eriophorum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:689',
  true,
  '2024-03-29',
  null,
  now(),
  '689',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lupina bílá',
  'Lupinus albus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:69',
  true,
  '2007-09-24',
  null,
  now(),
  '69',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pcháč bahenní',
  'Cirsium palustre',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:690',
  true,
  '2024-03-29',
  null,
  now(),
  '690',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pelyněk ladní',
  'Artemisia campestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:691',
  true,
  '2024-03-29',
  null,
  now(),
  '691',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pelyněk černobýl',
  'Artemisia vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:692',
  true,
  '2024-03-29',
  null,
  now(),
  '692',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ožanka kalamandra',
  'Teucrium chamaedrys',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:693',
  true,
  '2024-03-29',
  null,
  now(),
  '693',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ožanka horská',
  'Teucrium montanum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:694',
  true,
  '2024-03-29',
  null,
  now(),
  '694',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ovsíř pýřitý',
  'Avenula pubescens (Huds.) Dumort.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:695',
  true,
  '2024-03-29',
  null,
  now(),
  '695',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mydlice lékařská',
  'Saponaria officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:696',
  true,
  '2024-03-29',
  null,
  now(),
  '696',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mochna stříbrná',
  'Potentilla argentea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:697',
  true,
  '2024-03-29',
  null,
  now(),
  '697',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mochna přímá',
  'Potentilla recta',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:698',
  true,
  '2024-03-29',
  null,
  now(),
  '698',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mateřídouška vejčitá',
  'Thymus pulegioides',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:699',
  true,
  '2024-03-29',
  null,
  now(),
  '699',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ječmen jarní',
  'Hordeum vulgare L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:7',
  true,
  '2007-09-24',
  null,
  now(),
  '7',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ředkev olejná',
  'Raphanus sativus L.var.oleiformis Pers.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:70',
  true,
  '2007-09-24',
  null,
  now(),
  '70',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Abutilon hybridum',
  'Abutilon hybridum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:700',
  true,
  '2008-03-31',
  null,
  now(),
  '700',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Gilia capitata',
  'Gilia capitata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:701',
  true,
  '2008-03-31',
  null,
  now(),
  '701',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Stévie sladká',
  'Stevia rebaudiana',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:702',
  true,
  '2019-04-09',
  null,
  now(),
  '702',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Carthamus tinctorius',
  'Carthamus tinctorius',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:703',
  true,
  '2020-03-25',
  null,
  now(),
  '703',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Perilla frutescens',
  'Perilla frutescens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:704',
  true,
  '2021-07-07',
  null,
  now(),
  '704',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrastavec rolní',
  'Knautia arvensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:705',
  true,
  '2022-10-21',
  null,
  now(),
  '705',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa luční',
  'Centaurea jacea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:706',
  true,
  '2022-10-21',
  null,
  now(),
  '706',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zvonek rozkladitý',
  'Campanula patula',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:707',
  true,
  '2022-10-21',
  null,
  now(),
  '707',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'škarda dvouletá',
  'Crepis biennis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:708',
  true,
  '2022-10-21',
  null,
  now(),
  '708',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kohoutek luční',
  'Lychnis flos-cuculi',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:709',
  true,
  '2022-10-21',
  null,
  now(),
  '709',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepice',
  'Brassica rapa L.var. silvestris (Lam.) Briggs',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:71',
  true,
  '2007-09-24',
  null,
  now(),
  '71',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdík kartouzek',
  'Dianthus carthusianorum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:710',
  true,
  '2022-10-21',
  null,
  now(),
  '710',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kopretina bílá',
  'Leucanthemum vulgare',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:711',
  true,
  '2022-10-21',
  null,
  now(),
  '711',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'krvavec menší',
  'Sanguisorba minor',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:712',
  true,
  '2022-10-21',
  null,
  now(),
  '712',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svízel bílý',
  'Galium album',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:713',
  true,
  '2022-10-21',
  null,
  now(),
  '713',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ptačí noha setá',
  'Ornithopus sativus Brot.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:714',
  true,
  '2023-02-21',
  null,
  now(),
  '714',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'včelník moldavský',
  'Dracocephalum moldavica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:715',
  true,
  '2023-04-03',
  null,
  now(),
  '715',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mateřídouška obecná',
  'Thymus serpyllum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:716',
  true,
  '2024-04-04',
  null,
  now(),
  '716',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mateřídouška časná',
  'Thymus praecox',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:717',
  true,
  '2024-04-04',
  null,
  now(),
  '717',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'máta dlouholistá',
  'Mentha longifolia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:718',
  true,
  '2024-04-04',
  null,
  now(),
  '718',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mák vlčí',
  'Papaver rhoeas',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:719',
  true,
  '2024-04-04',
  null,
  now(),
  '719',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sudánská tráva',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:72',
  true,
  '2007-09-24',
  null,
  now(),
  '72',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'máchelka srstnatá',
  'Leontodon hispidus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:720',
  true,
  '2024-04-04',
  null,
  now(),
  '720',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'máchelka podzimní',
  'Leontodon autumnalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:721',
  true,
  '2024-04-04',
  null,
  now(),
  '721',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lokanka lepá',
  'Clarkia unguiculata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:722',
  true,
  '2024-04-04',
  null,
  now(),
  '722',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lnice květel',
  'Linaria vulgaris Mill.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:723',
  true,
  '2024-04-04',
  null,
  now(),
  '723',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lipnice úzkolistá',
  'Poa  angustifolia  L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:724',
  true,
  '2024-04-04',
  null,
  now(),
  '724',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'len vytrvalý',
  'Linum perenne',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:725',
  true,
  '2024-04-04',
  null,
  now(),
  '725',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'len rakouský',
  'Linum austriacum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:726',
  true,
  '2024-04-05',
  null,
  now(),
  '726',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ledenec přímořský',
  'Lotus maritimus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:727',
  true,
  '2024-04-05',
  null,
  now(),
  '727',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'laskavec červenoklasý',
  'Amaranthus hypochondriacus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:728',
  true,
  '2024-04-05',
  null,
  now(),
  '728',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kuklík potoční',
  'Geum rivale',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:729',
  true,
  '2024-04-05',
  null,
  now(),
  '729',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'svazenka vratičolistá',
  'Phacelia tanacetifolia Benth.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:73',
  true,
  '2007-09-24',
  null,
  now(),
  '73',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kuklík městský',
  'Geum urbanum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:730',
  true,
  '2024-04-05',
  null,
  now(),
  '730',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'krvavec toten',
  'Sanguisorba officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:731',
  true,
  '2024-04-05',
  null,
  now(),
  '731',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kručinka barvířská',
  'Genista tinctoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:732',
  true,
  '2024-04-05',
  null,
  now(),
  '732',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kravinec polní',
  'Saponaria vaccaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:733',
  true,
  '2024-04-05',
  null,
  now(),
  '733',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozí brada východní',
  'Tragopogon orientalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:734',
  true,
  '2024-04-05',
  null,
  now(),
  '734',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozí brada pochybná',
  'Tragopogon dubius',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:735',
  true,
  '2024-04-05',
  null,
  now(),
  '735',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozí brada luční',
  'Tragopogon pratensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:736',
  true,
  '2024-04-05',
  null,
  now(),
  '736',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'koukol polní',
  'Agrostemma githago',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:737',
  true,
  '2024-04-05',
  null,
  now(),
  '737',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava žlábkatá',
  'Festuca rupicola',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:738',
  true,
  '2024-04-05',
  null,
  now(),
  '738',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava sivá',
  'Festuca pallens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:739',
  true,
  '2024-04-05',
  null,
  now(),
  '739',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'oves hřebílkatý',
  'Avena strigosa Schreb.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:74',
  true,
  '2017-04-19',
  null,
  now(),
  '74',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kostřava načernalá',
  '?Festuca nigrescens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:740',
  true,
  '2024-04-05',
  null,
  now(),
  '740',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kontryhel žlutozelený',
  'Alchemilla xanthochlora',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:741',
  true,
  '2024-04-05',
  null,
  now(),
  '741',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kokrhel menší',
  'Rhinanthus minor',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:742',
  true,
  '2024-04-05',
  null,
  now(),
  '742',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kohoutek věncový',
  'Lychnis coronaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:743',
  true,
  '2024-04-05',
  null,
  now(),
  '743',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'klinopád obecný',
  'Clinopodium vulgare',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:744',
  true,
  '2024-04-05',
  null,
  now(),
  '744',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kerblík lesní',
  'Anthriscus sylvestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:745',
  true,
  '2024-04-05',
  null,
  now(),
  '745',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kavyl vláskovitý',
  'Stipa capillata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:746',
  true,
  '2024-04-05',
  null,
  now(),
  '746',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bedrník obecný',
  'Pimpinella saxifraga',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:747',
  true,
  '2024-04-05',
  null,
  now(),
  '747',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kakost krvavý',
  'Geranium sanguineum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:748',
  true,
  '2024-04-05',
  null,
  now(),
  '748',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kakost bahenní',
  'Geranium palustre',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:749',
  true,
  '2024-04-05',
  null,
  now(),
  '749',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čekanka obecná',
  'Cichorium intybus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:75',
  true,
  '2007-09-24',
  null,
  now(),
  '75',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jitrocel větší',
  'Plantago major',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:750',
  true,
  '2024-04-05',
  null,
  now(),
  '750',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jitrocel prostřední',
  'Plantago media',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:751',
  true,
  '2024-04-05',
  null,
  now(),
  '751',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel panonský',
  'Trifolium pannonicum Jacq.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:752',
  true,
  '2024-04-05',
  null,
  now(),
  '752',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev ptačí',
  'Vicia cracca',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:753',
  true,
  '2024-04-05',
  null,
  now(),
  '753',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel ladní',
  'Trifolium campestre',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:754',
  true,
  '2024-04-05',
  null,
  now(),
  '754',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jestřábník savojský',
  'Hieracium sabaudum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:755',
  true,
  '2024-04-05',
  null,
  now(),
  '755',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jestřábník okoličnatý',
  'Hieracium umbellatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:756',
  true,
  '2024-04-05',
  null,
  now(),
  '756',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jestřábník chlupáček',
  'Hieracium pilosella',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:757',
  true,
  '2024-04-05',
  null,
  now(),
  '757',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jarmanka větší',
  'Astrantia major',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:758',
  true,
  '2024-04-05',
  null,
  now(),
  '758',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa parukářka',
  'Centaurea pseudophrygia',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:759',
  true,
  '2024-04-05',
  null,
  now(),
  '759',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čekanka_obecná',
  'Cichorium intybus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:76',
  true,
  '2024-03-18',
  null,
  now(),
  '76',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa modrá',
  'Centaurea cyanus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:760',
  true,
  '2024-04-05',
  null,
  now(),
  '760',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa latnatá',
  'Centaurea stoebe',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:761',
  true,
  '2024-04-05',
  null,
  now(),
  '761',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa čekánek',
  'Centaurea scabiosa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:762',
  true,
  '2024-04-05',
  null,
  now(),
  '762',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdík svazčitý',
  'Dianthus armeria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:763',
  true,
  '2024-04-05',
  null,
  now(),
  '763',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdík kropenatý',
  'Dianthus deltoides',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:764',
  true,
  '2024-04-05',
  null,
  now(),
  '764',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hvozdíček prorostlý',
  'Petrorhagia prolifera',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:765',
  true,
  '2024-04-05',
  null,
  now(),
  '765',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrachor luční',
  'Lathyrus pratensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:766',
  true,
  '2024-04-05',
  null,
  now(),
  '766',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrachor jarní',
  'Lathyrus vernus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:767',
  true,
  '2024-04-05',
  null,
  now(),
  '767',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrachor černý',
  'Lathyrus niger',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:768',
  true,
  '2024-04-05',
  null,
  now(),
  '768',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bělozářka liliovitá',
  'Anthericum liliago',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:769',
  true,
  '2024-04-05',
  null,
  now(),
  '769',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kapusta krmná',
  'Brassica oleracea L. convar.acephala(DC.)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:77',
  true,
  '2007-09-24',
  null,
  now(),
  '77',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hlaváček letní',
  'Adonis aestivalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:770',
  true,
  '2024-04-05',
  null,
  now(),
  '770',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hlaváč šedavý',
  'Scabiosa canescens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:771',
  true,
  '2024-04-05',
  null,
  now(),
  '771',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hlaváč bledožlutý',
  'Scabiosa ochroleuca L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:772',
  true,
  '2024-04-05',
  null,
  now(),
  '772',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hadinec obecný',
  'Echium vulgare',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:773',
  true,
  '2024-04-05',
  null,
  now(),
  '773',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'gazánie zářivá',
  'Gazania splendens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:774',
  true,
  '2024-04-05',
  null,
  now(),
  '774',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'dvoutvárka oranžová',
  'Dimorphoteka aurantiaca',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:775',
  true,
  '2024-04-05',
  null,
  now(),
  '775',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'divizna rakouská',
  'Verbascum austriacum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:776',
  true,
  '2024-04-05',
  null,
  now(),
  '776',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'divizna malokvětá',
  'Verbascum thapsus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:777',
  true,
  '2024-04-05',
  null,
  now(),
  '777',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'divizna jižní',
  'Verbascum chaixii',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:778',
  true,
  '2024-04-05',
  null,
  now(),
  '778',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'divizna černá',
  'Verbascum nigrum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:779',
  true,
  '2024-04-05',
  null,
  now(),
  '779',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel šípovitý',
  'Trifolium vesiculosum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:78',
  true,
  '2017-01-24',
  null,
  now(),
  '78',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'devětsil bílý',
  'Petasites albus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:780',
  true,
  '2024-04-05',
  null,
  now(),
  '780',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'devaterník velkokvětý',
  'Helianthemum grandiflorum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:781',
  true,
  '2024-04-05',
  null,
  now(),
  '781',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čistec přímý',
  'Stachys recta',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:782',
  true,
  '2024-04-05',
  null,
  now(),
  '782',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čistec německý',
  'Stachys germanica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:783',
  true,
  '2024-04-05',
  null,
  now(),
  '783',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čistec lesní',
  'Stachys sylvatica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:784',
  true,
  '2024-04-05',
  null,
  now(),
  '784',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černucha španělská',
  'Nigella hispanica',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:785',
  true,
  '2024-04-07',
  null,
  now(),
  '785',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černohlávek obecný',
  'Prunella vulgaris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:786',
  true,
  '2024-04-07',
  null,
  now(),
  '786',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černohlávek velkokvětý',
  'Prunella grandiflora',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:787',
  true,
  '2024-04-07',
  null,
  now(),
  '787',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bukvice lékařská',
  'Betonica officinalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:788',
  true,
  '2024-04-07',
  null,
  now(),
  '788',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'boryt barvířský',
  'Isatis tinctoria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:789',
  true,
  '2024-04-07',
  null,
  now(),
  '789',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mrkev krmná',
  'Daucus carota L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:79',
  true,
  '2007-09-24',
  null,
  now(),
  '79',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bolševník obecný',
  'Heracleum sphondylium',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:790',
  true,
  '2024-04-07',
  null,
  now(),
  '790',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bojínek tuhý',
  'Phleum phleoides',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:791',
  true,
  '2024-04-07',
  null,
  now(),
  '791',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bika ladní',
  'Luzula campestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:792',
  true,
  '2024-04-07',
  null,
  now(),
  '792',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bělozářka větevnatá',
  'Anthericum ramosum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:793',
  true,
  '2024-04-07',
  null,
  now(),
  '793',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rozrazil rezekvítek',
  'Veronica chamaedrys',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:794',
  true,
  '2024-04-05',
  null,
  now(),
  '794',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel horský',
  'Trifolium montanum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:795',
  true,
  '2024-04-24',
  null,
  now(),
  '795',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pryskyřník hlíznatý',
  'Ranunculus bulbosus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:796',
  true,
  '2024-06-17',
  null,
  now(),
  '796',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'šťovík kyselý',
  'Rumex acetosa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:797',
  true,
  '2024-06-26',
  null,
  now(),
  '797',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'podzemnice olejná',
  'Arachis hypogaea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:798',
  true,
  '2024-07-31',
  null,
  now(),
  '798',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'zlateň věncová',
  'Glebionis coronaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:799',
  true,
  '2024-08-06',
  null,
  now(),
  '799',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'tritikale ozimé',
  'xTriticosecale Wittm. ex  A. Camus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:8',
  true,
  '2007-09-24',
  null,
  now(),
  '8',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'prorostlík srpovitý',
  'Bupleurum falcatum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:800',
  true,
  '2024-08-09',
  null,
  now(),
  '800',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'máchelka',
  'Leontodon',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:801',
  true,
  '2024-08-09',
  null,
  now(),
  '801',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'mochna nátržník',
  'Potentilla erecta',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:802',
  true,
  '2024-08-15',
  null,
  now(),
  '802',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kyprej vrbice',
  'Lythrum salicaria',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:803',
  true,
  '2024-08-21',
  null,
  now(),
  '803',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrpa chlumní',
  'Centaurea triumfettii',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:804',
  true,
  '2024-11-05',
  null,
  now(),
  '804',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ptačinec velkokvětý',
  'Stellaria holostea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:805',
  true,
  '2024-11-05',
  null,
  now(),
  '805',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'violka psí',
  'Viola canina',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:806',
  true,
  '2024-11-05',
  null,
  now(),
  '806',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'válečka lesní',
  'Brachypodium sylvaticum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:807',
  true,
  '2024-11-05',
  null,
  now(),
  '807',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'sveřep jalový',
  'Bromus sterilis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:808',
  true,
  '2024-11-05',
  null,
  now(),
  '808',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'hrachor širolistý',
  'Lathyrus latifolius',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:809',
  true,
  '2024-11-07',
  null,
  now(),
  '809',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepa krmná',
  'Beta vulgaris L. var.crassa Mansf.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:81',
  true,
  '2007-09-24',
  null,
  now(),
  '81',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel alpský',
  'Trifolium alpinum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:810',
  true,
  '2024-11-08',
  null,
  now(),
  '810',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bílojetel bylinný',
  'Dorycnium herbaceum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:811',
  true,
  '2024-11-08',
  null,
  now(),
  '811',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kozinec cizrnovitý',
  'Astragalus cicer',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:812',
  true,
  '2024-11-08',
  null,
  now(),
  '812',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ostrožka východní',
  'Consolida orientalis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:813',
  true,
  '2024-11-19',
  null,
  now(),
  '813',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'paprika čínská',
  'Capsicum chinense',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:814',
  true,
  '2025-01-14',
  null,
  now(),
  '814',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'Dichondra sp.',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:815',
  true,
  '2025-01-16',
  null,
  now(),
  '815',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'bob zahradní',
  'Vicia faba L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:816',
  true,
  '2025-01-21',
  null,
  now(),
  '816',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chřestnatec sítinovitý',
  'Crotalaria juncea',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:817',
  true,
  '2025-03-21',
  null,
  now(),
  '817',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čilimník zelenavý',
  'Chamaecytisus virescens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:818',
  true,
  '2025-04-15',
  null,
  now(),
  '818',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'chrastavec Kitaibelův',
  'Knautia Kitaibelii',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:819',
  true,
  '2025-04-15',
  null,
  now(),
  '819',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černohlávek dřípený',
  'Prunella laciniata',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:820',
  true,
  '2025-04-16',
  null,
  now(),
  '820',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'pohanka tatarská',
  'Fagopyrum tataricum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:821',
  true,
  '2025-08-12',
  null,
  now(),
  '821',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel červenavý',
  'Trifolium rubens',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:822',
  true,
  '2025-09-03',
  null,
  now(),
  '822',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'rýže',
  'Oryza sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:823',
  true,
  '2025-10-21',
  null,
  now(),
  '823',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'borovice lesní',
  'Pinus sylvestris',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:824',
  true,
  '2025-12-09',
  null,
  now(),
  '824',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'merlík čilský',
  'Chenopodium quinoa',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:825',
  true,
  '2025-12-22',
  null,
  now(),
  '825',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'vikev narbonská',
  'Vicia narbonensis',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:826',
  true,
  '2026-01-26',
  null,
  now(),
  '826',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'lichořeřišnice větší',
  'Tropaeolum majus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:827',
  true,
  '2026-03-24',
  null,
  now(),
  '827',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'jetel kostrbatý',
  'Trifolium squarrosum',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:828',
  true,
  '2026-04-13',
  null,
  now(),
  '828',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'milička habešská',
  'Eragrostis tef',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:829',
  true,
  '2026-05-12',
  null,
  now(),
  '829',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'řepa cukrová',
  'Beta vulgaris L. var.altissima Dőll',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:83',
  true,
  '2007-09-24',
  null,
  now(),
  '83',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'ředkev setá bílá',
  'Raphanus sativus var. longipinnatus',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:830',
  true,
  '2026-05-15',
  null,
  now(),
  '830',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'brambory',
  'Solanum tuberosum L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:84',
  true,
  '2007-09-24',
  null,
  now(),
  '84',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'brokolice',
  'Brassica oleracea L. (skupina Brokolice)',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:85',
  true,
  '2007-09-24',
  null,
  now(),
  '85',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'kedluben',
  'Brassica oleracea L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:87',
  true,
  '2007-09-24',
  null,
  now(),
  '87',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'celer',
  'Apium graveolens L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:89',
  true,
  '2007-09-24',
  null,
  now(),
  '89',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'oves setý jarní',
  'Avena sativa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:9',
  true,
  '2007-09-24',
  null,
  now(),
  '9',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'neznámý druh',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:9000',
  true,
  '2007-09-24',
  null,
  now(),
  '9000',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'celer listový',
  'APIUM GRAVEOLENS',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:91',
  true,
  '2007-09-24',
  null,
  now(),
  '91',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'cibule',
  'Allium cepa L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:94',
  true,
  '2007-09-24',
  null,
  now(),
  '94',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čekanka',
  'Cichorium intybus L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:97',
  true,
  '2007-09-24',
  null,
  now(),
  '97',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'černý kořen',
  'Scorzonera hispanica L.',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:98',
  true,
  '2007-09-24',
  null,
  now(),
  '98',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'čtyřboč rozložitá',
  'Tetragonia tetragonoides (Pall.) Kuntze',
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:99',
  true,
  '2007-09-24',
  null,
  now(),
  '99',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

insert into public.crop_catalog (
  name,
  scientific_name,
  source,
  source_reference,
  active,
  valid_from,
  valid_to,
  last_verified_at,
  external_code,
  source_system,
  source_status,
  source_valid,
  catalog_kind
)
values (
  'směs',
  null,
  'ÚKZÚZ OOS_CIS01D',
  'OOS_CIS01D:Druh:9999',
  true,
  '2007-09-24',
  null,
  now(),
  '9999',
  'UKZUZ_OOS_CIS01D',
  'Ano',
  true,
  'official_species'
)
on conflict (source_system, external_code)
where external_code is not null
do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  source = excluded.source,
  source_reference = excluded.source_reference,
  active = excluded.active,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  last_verified_at = excluded.last_verified_at,
  source_status = excluded.source_status,
  source_valid = excluded.source_valid,
  catalog_kind = excluded.catalog_kind,
  updated_at = now();

commit;
