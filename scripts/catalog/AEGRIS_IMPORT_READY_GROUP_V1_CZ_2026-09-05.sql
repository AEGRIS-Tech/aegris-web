-- AEGRIS GROUP v1 – konzervativní produkční import
-- Datum: 2026-09-05
-- Rozsah: 2 GROUP templaty, 18 explicitních ÚKZÚZ druhů.
-- Teplota/pH/water_need zůstávají NULL, pokud nejsou bezpečně doloženy.
-- Zdroje:
--   FAO-56 Kc: https://www.fao.org/4/x0490e/x0490e0b.htm
--   FAO-56 root/p: https://www.fao.org/4/x0490e/x0490e0e.htm
--   EPPO BBCH: https://gd.eppo.int/reporting/article-6991

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.crop_profiles') IS NULL THEN RAISE EXCEPTION 'Chybí public.crop_profiles'; END IF;
  IF to_regclass('public.crop_stage_profiles') IS NULL THEN RAISE EXCEPTION 'Chybí public.crop_stage_profiles'; END IF;
  IF to_regclass('public.crop_catalog') IS NULL THEN RAISE EXCEPTION 'Chybí public.crop_catalog'; END IF;
  IF to_regclass('public.aegris_agronomic_profile_provenance_v1') IS NULL THEN
    RAISE EXCEPTION 'Chybí provenance v1 – nejprve musí být aplikován DIRECT import.';
  END IF;
END $$;

ALTER TABLE public.aegris_agronomic_profile_provenance_v1
  ADD COLUMN IF NOT EXISTS mapping_scope text,
  ADD COLUMN IF NOT EXISTS group_version text;

CREATE TEMP TABLE aegris_group_profiles (
  profile_key text PRIMARY KEY,
  profile_name text NOT NULL,
  czech_name text NOT NULL,
  fao_crop_reference text NOT NULL,
  kc_ini numeric NOT NULL,
  kc_mid numeric NOT NULL,
  kc_end numeric NOT NULL,
  root_depth_min_m numeric NOT NULL,
  root_depth_max_m numeric NOT NULL,
  depletion_fraction_p numeric NOT NULL,
  stage_ini text NOT NULL,
  stage_mid text NOT NULL,
  stage_end text NOT NULL,
  confidence text NOT NULL
) ON COMMIT DROP;

INSERT INTO aegris_group_profiles VALUES
('group_clover_hay_fao56','AEGRIS GROUP · Jeteloviny – seno / píce','Jeteloviny – seno / píce','Clover hay, Berseem – averaged cutting effects',0.4,0.9,0.85,0.6,0.9,0.5,'Po seči / počáteční růst','Plný porost','Pozdní fáze / před další sečí','medium_high_group_analogue'),
('group_sudan_grass_hay_fao56','AEGRIS GROUP · Čirok súdánská tráva – píce','Čirok súdánská tráva – píce','Sudan Grass hay (annual) – averaged cutting effects',0.5,0.9,0.85,1.0,1.5,0.55,'Počáteční růst','Plný porost / před sečí','Pozdní fáze','high_group_exact_crop_type');

CREATE TEMP TABLE aegris_group_mapping (
  external_code text PRIMARY KEY,
  czech_species_name text NOT NULL,
  scientific_name text,
  profile_key text NOT NULL
) ON COMMIT DROP;

INSERT INTO aegris_group_mapping VALUES
('31','jetel luční','Trifolium pratense L.','group_clover_hay_fao56'),
('33','jetel nachový','Trifolium incarnatum L.','group_clover_hay_fao56'),
('34','jetel plazivý','Trifolium repens L.','group_clover_hay_fao56'),
('35','jetel zvrhlý','Trifolium hybridum L.','group_clover_hay_fao56'),
('407','jetel zvrácený','Trifolium resupinatum L.','group_clover_hay_fao56'),
('424','jetel prostřední','Trifolium medium L.','group_clover_hay_fao56'),
('560','jetel luční x jetel prostřední','Trifolium pratense L. x Trifolium medium L.','group_clover_hay_fao56'),
('568','jetel kavkazský','Trifolium ambiguum','group_clover_hay_fao56'),
('571','jetel michelianský','Trifolium michelianum','group_clover_hay_fao56'),
('574','jetel podzemní','Trifolium subterraneum L.','group_clover_hay_fao56'),
('752','jetel panonský','Trifolium pannonicum Jacq.','group_clover_hay_fao56'),
('754','jetel ladní','Trifolium campestre','group_clover_hay_fao56'),
('78','jetel šípovitý','Trifolium vesiculosum','group_clover_hay_fao56'),
('795','jetel horský','Trifolium montanum','group_clover_hay_fao56'),
('810','jetel alpský','Trifolium alpinum','group_clover_hay_fao56'),
('822','jetel červenavý','Trifolium rubens','group_clover_hay_fao56'),
('828','jetel kostrbatý','Trifolium squarrosum','group_clover_hay_fao56'),
('432','čirok súdánská tráva','Sorghum bicolor (L.) Moench subsp. drummondii (Steud.) de Wet ex Davidse','group_sudan_grass_hay_fao56');

DO $$
DECLARE
  pc integer;
  mc integer;
  missing integer;
BEGIN
  SELECT count(*) INTO pc FROM aegris_group_profiles;
  SELECT count(*) INTO mc FROM aegris_group_mapping;
  IF pc <> 2 THEN RAISE EXCEPTION 'GROUP v1 čekal 2 templaty, ale našel %', pc; END IF;
  IF mc <> 18 THEN RAISE EXCEPTION 'GROUP v1 čekal 18 mapování, ale našel %', mc; END IF;

  SELECT count(*) INTO missing
  FROM aegris_group_mapping m
  LEFT JOIN public.crop_catalog cc
    ON cc.source_system = 'UKZUZ_OOS_CIS01D'
   AND cc.external_code::text = m.external_code
  WHERE cc.id IS NULL;

  IF missing <> 0 THEN
    RAISE EXCEPTION 'V crop_catalog chybí % z 18 očekávaných GROUP druhů. Transakce zrušena.', missing;
  END IF;
END $$;

INSERT INTO public.aegris_agronomic_profile_provenance_v1 (
  profile_key, profile_name, czech_name, fao_crop_reference,
  kc_ini, kc_mid, kc_end, kc_ini_raw, kc_mid_raw, kc_end_raw,
  root_depth_min_m, root_depth_max_m, depletion_fraction_p,
  water_need_min_mm, water_need_max_mm, drought_sensitivity,
  ecocrop_url, environmental_status, evidence_type, confidence,
  mapping_scope, group_version, verified_at
)
SELECT
  p.profile_key, p.profile_name, p.czech_name, p.fao_crop_reference,
  p.kc_ini, p.kc_mid, p.kc_end,
  p.kc_ini::text, p.kc_mid::text, p.kc_end::text,
  p.root_depth_min_m, p.root_depth_max_m, p.depletion_fraction_p,
  NULL, NULL, NULL,
  NULL, 'GROUP_SOURCE_BACKED_NO_ENVIRONMENTAL_VALUES', 'GROUP', p.confidence,
  CASE
    WHEN p.profile_key = 'group_clover_hay_fao56' THEN 'Trifolium spp. – forage clover group'
    WHEN p.profile_key = 'group_sudan_grass_hay_fao56' THEN 'Sorghum bicolor subsp. drummondii – Sudan grass forage type'
  END,
  'GROUP_v1_2026-09-05',
  DATE '2026-09-05'
FROM aegris_group_profiles p
ON CONFLICT (profile_key) DO UPDATE SET
  profile_name = EXCLUDED.profile_name,
  czech_name = EXCLUDED.czech_name,
  fao_crop_reference = EXCLUDED.fao_crop_reference,
  kc_ini = EXCLUDED.kc_ini,
  kc_mid = EXCLUDED.kc_mid,
  kc_end = EXCLUDED.kc_end,
  kc_ini_raw = EXCLUDED.kc_ini_raw,
  kc_mid_raw = EXCLUDED.kc_mid_raw,
  kc_end_raw = EXCLUDED.kc_end_raw,
  root_depth_min_m = EXCLUDED.root_depth_min_m,
  root_depth_max_m = EXCLUDED.root_depth_max_m,
  depletion_fraction_p = EXCLUDED.depletion_fraction_p,
  environmental_status = EXCLUDED.environmental_status,
  evidence_type = EXCLUDED.evidence_type,
  confidence = EXCLUDED.confidence,
  mapping_scope = EXCLUDED.mapping_scope,
  group_version = EXCLUDED.group_version,
  verified_at = EXCLUDED.verified_at;

INSERT INTO public.crop_profiles (
  name, category, min_temperature_c, max_temperature_c,
  soil_moisture_min_pct, soil_moisture_max_pct,
  ph_min, ph_max, water_need, light_need, notes
)
SELECT
  p.profile_name,
  'AEGRIS GROUP v1',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'AEGRIS GROUP v1; FAO-56 group template; bez species-level teploty/pH a bez nedoloženého seasonal water need.'
FROM aegris_group_profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.crop_profiles cp WHERE cp.name = p.profile_name
);

UPDATE public.crop_profiles cp
SET
  category = 'AEGRIS GROUP v1',
  notes = 'AEGRIS GROUP v1; FAO-56 group template; bez species-level teploty/pH a bez nedoloženého seasonal water need.'
FROM aegris_group_profiles p
WHERE cp.name = p.profile_name;

CREATE TEMP TABLE aegris_group_stages AS
SELECT profile_name, stage_ini AS growth_stage, kc_ini AS kc FROM aegris_group_profiles
UNION ALL
SELECT profile_name, stage_mid, kc_mid FROM aegris_group_profiles
UNION ALL
SELECT profile_name, stage_end, kc_end FROM aegris_group_profiles;

INSERT INTO public.crop_stage_profiles (
  crop_profile_id, growth_stage, kc,
  min_temperature_c, max_temperature_c, water_stress_sensitivity
)
SELECT cp.id, s.growth_stage, s.kc, NULL, NULL, NULL
FROM aegris_group_stages s
JOIN public.crop_profiles cp ON cp.name = s.profile_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.crop_stage_profiles csp
  WHERE csp.crop_profile_id = cp.id AND csp.growth_stage = s.growth_stage
);

UPDATE public.crop_stage_profiles csp
SET kc = s.kc
FROM aegris_group_stages s
JOIN public.crop_profiles cp ON cp.name = s.profile_name
WHERE csp.crop_profile_id = cp.id
  AND csp.growth_stage = s.growth_stage;

CREATE TABLE IF NOT EXISTS public.aegris_crop_catalog_group_v1_backup_20260905 AS
SELECT
  cc.id AS crop_catalog_id,
  cc.source_system,
  cc.external_code,
  cc.name,
  cc.crop_profile_id AS previous_crop_profile_id,
  now() AS backed_up_at
FROM public.crop_catalog cc
JOIN aegris_group_mapping m
  ON cc.source_system = 'UKZUZ_OOS_CIS01D'
 AND cc.external_code::text = m.external_code;

UPDATE public.crop_catalog cc
SET crop_profile_id = cp.id
FROM aegris_group_mapping m
JOIN aegris_group_profiles p ON p.profile_key = m.profile_key
JOIN public.crop_profiles cp ON cp.name = p.profile_name
WHERE cc.source_system = 'UKZUZ_OOS_CIS01D'
  AND cc.external_code::text = m.external_code;

DO $$
DECLARE
  mapped integer;
  profiles integer;
BEGIN
  SELECT count(*) INTO profiles
  FROM public.crop_profiles cp
  JOIN aegris_group_profiles p ON p.profile_name = cp.name;

  SELECT count(*) INTO mapped
  FROM public.crop_catalog cc
  JOIN aegris_group_mapping m
    ON cc.source_system = 'UKZUZ_OOS_CIS01D'
   AND cc.external_code::text = m.external_code
  JOIN aegris_group_profiles p ON p.profile_key = m.profile_key
  JOIN public.crop_profiles cp
    ON cp.name = p.profile_name
   AND cp.id = cc.crop_profile_id;

  IF profiles <> 2 THEN RAISE EXCEPTION 'Po GROUP v1 nejsou 2 profily, ale %', profiles; END IF;
  IF mapped <> 18 THEN RAISE EXCEPTION 'Po GROUP v1 není správně namapováno 18 druhů, ale %', mapped; END IF;

  RAISE NOTICE 'AEGRIS GROUP v1 OK: % templaty, % ÚKZÚZ druhů namapováno.', profiles, mapped;
END $$;

COMMIT;

SELECT
  cp.name AS profil,
  cp.category,
  csp.growth_stage,
  csp.kc,
  (
    SELECT count(*)
    FROM public.crop_catalog cc
    WHERE cc.crop_profile_id = cp.id
  ) AS pocet_ukzuz_druhu
FROM public.crop_profiles cp
JOIN public.crop_stage_profiles csp ON csp.crop_profile_id = cp.id
WHERE cp.category = 'AEGRIS GROUP v1'
ORDER BY cp.name, csp.growth_stage;
