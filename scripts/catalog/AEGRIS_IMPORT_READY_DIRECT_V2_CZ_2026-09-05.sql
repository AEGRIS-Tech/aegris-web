-- AEGRIS DIRECT v2 – environmentální doplnění
-- Datum: 2026-09-05
-- Produkční rozsah: 22 již existujících DIRECT profilů
-- GROUP staging se tímto skriptem NEIMPORTUJE.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.crop_profiles') IS NULL THEN
    RAISE EXCEPTION 'Chybí public.crop_profiles';
  END IF;
  IF to_regclass('public.aegris_agronomic_profile_provenance_v1') IS NULL THEN
    RAISE EXCEPTION 'Chybí public.aegris_agronomic_profile_provenance_v1 – nejprve musí být aplikován DIRECT v1.';
  END IF;
END $$;

ALTER TABLE public.aegris_agronomic_profile_provenance_v1
  ADD COLUMN IF NOT EXISTS temp_abs_min_c numeric,
  ADD COLUMN IF NOT EXISTS temp_abs_max_c numeric,
  ADD COLUMN IF NOT EXISTS ph_abs_min numeric,
  ADD COLUMN IF NOT EXISTS ph_abs_max numeric,
  ADD COLUMN IF NOT EXISTS environmental_match_basis text;

CREATE TEMP TABLE aegris_direct_v2_env (
  profile_key text PRIMARY KEY,
  temp_opt_min_c numeric,
  temp_opt_max_c numeric,
  temp_abs_min_c numeric,
  temp_abs_max_c numeric,
  ph_opt_min numeric,
  ph_opt_max numeric,
  ph_abs_min numeric,
  ph_abs_max numeric,
  ecocrop_url text,
  match_basis text
) ON COMMIT DROP;

INSERT INTO aegris_direct_v2_env VALUES
('asparagus',15,30,6,38,6,6.7,4.5,8.2,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=468','Asparagus officinalis – exact species'),
('brussels_sprouts',12,20,7,25,6,7,4.5,7.8,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=555','Brassica oleracea var. gemmifera – exact crop type'),
('carrot',15,24,3,30,5.8,6.8,4.2,8.7,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=871','Daucus carota – exact species'),
('castor',20,30,15,39,5,6.5,4.5,8,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1866','Ricinus communis – exact species'),
('eggplant',20,35,9,40,5.5,6.8,4.3,8.5,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1965','Solanum melongena – exact species'),
('faba_bean_dry',18,28,5,32,6,7,4.5,8.6,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146','Vicia faba – exact species'),
('flax',16,24,5,30,6,6.5,5.5,7,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7336','Linum usitatissimum – exact species'),
('lentil',15,29,5,32,5.5,7.5,4.5,8.2,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7209','Lens culinaris – exact species'),
('millet',20,32,15,45,6,6.5,5.2,8.2,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=8280','Panicum miliaceum – exact species'),
('onion_dry',12,25,4,30,6,7,4.3,8.3,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=364','Allium cepa – exact species'),
('onion_green',12,25,6,30,6.6,7.4,5.5,8.5,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=365','Allium fistulosum – exact species'),
('parsnip',15,21,5,25,6,6.8,5.8,8.3,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1642','Pastinaca sativa – exact species'),
('peanut',22,32,10,45,5.5,6.5,4.5,8.5,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2199','Arachis hypogaea – exact species'),
('peas_dry',10,24,4,30,5.5,7,4.5,8.3,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721','Pisum sativum – exact species'),
('rapeseed_canola',15,25,5,41,6.5,7.6,5.5,8,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=549','Brassica napus – exact species'),
('rice',20,30,10,36,5.5,7,4.5,9,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1574','Oryza sativa – exact species'),
('safflower',20,32,5,45,6.5,7.5,5,8,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2514','Carthamus tinctorius – exact species'),
('spinach',13,20,2,27,6,7.5,5.3,8.3,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1997','Spinacia oleracea – exact species'),
('sweet_melon',18,30,9,35,6,7.5,5,8.7,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=815','Cucumis melo – exact species'),
('table_beet',15,25,5,30,6,6.8,5,8.3,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=3712','Beta vulgaris var. crassa / beetroot use match'),
('turnip_rutabaga',14,24,5,35,5.5,7,4.8,7.8,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=3861','Brassica napus var. napobrassica – exact crop type'),
('watermelon',20,35,15,40,6,7,5.5,7.5,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=708','Citrullus lanatus – exact species');

DO $$
DECLARE
  c integer;
  missing integer;
BEGIN
  SELECT count(*) INTO c FROM aegris_direct_v2_env;
  IF c <> 22 THEN
    RAISE EXCEPTION 'DIRECT v2 čekal 22 profilů, ale našel %', c;
  END IF;

  SELECT count(*) INTO missing
  FROM aegris_direct_v2_env v
  LEFT JOIN public.aegris_agronomic_profile_provenance_v1 p
    ON p.profile_key = v.profile_key
  WHERE p.profile_key IS NULL;

  IF missing <> 0 THEN
    RAISE EXCEPTION 'V provenance chybí % profilů DIRECT v2. Transakce zrušena.', missing;
  END IF;
END $$;

-- Záloha hodnot před DIRECT v2 (jen první běh).
CREATE TABLE IF NOT EXISTS public.aegris_direct_v2_env_backup_20260905 AS
SELECT
  p.profile_key,
  cp.id AS crop_profile_id,
  cp.min_temperature_c AS previous_min_temperature_c,
  cp.max_temperature_c AS previous_max_temperature_c,
  cp.ph_min AS previous_ph_min,
  cp.ph_max AS previous_ph_max,
  p.ecocrop_url AS previous_ecocrop_url,
  p.environmental_status AS previous_environmental_status,
  now() AS backed_up_at
FROM public.aegris_agronomic_profile_provenance_v1 p
JOIN public.crop_profiles cp ON cp.name = p.profile_name
JOIN aegris_direct_v2_env v ON v.profile_key = p.profile_key;

UPDATE public.crop_profiles cp
SET
  min_temperature_c = v.temp_opt_min_c,
  max_temperature_c = v.temp_opt_max_c,
  ph_min = v.ph_opt_min,
  ph_max = v.ph_opt_max
FROM public.aegris_agronomic_profile_provenance_v1 p
JOIN aegris_direct_v2_env v ON v.profile_key = p.profile_key
WHERE cp.name = p.profile_name;

UPDATE public.aegris_agronomic_profile_provenance_v1 p
SET
  ecocrop_url = v.ecocrop_url,
  environmental_status = 'OVĚŘENO_ECOCROP_V2',
  temp_abs_min_c = v.temp_abs_min_c,
  temp_abs_max_c = v.temp_abs_max_c,
  ph_abs_min = v.ph_abs_min,
  ph_abs_max = v.ph_abs_max,
  environmental_match_basis = v.match_basis,
  verified_at = DATE '2026-09-05'
FROM aegris_direct_v2_env v
WHERE p.profile_key = v.profile_key;

DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT count(*) INTO updated_count
  FROM public.aegris_agronomic_profile_provenance_v1
  WHERE profile_key IN (SELECT profile_key FROM aegris_direct_v2_env)
    AND environmental_status = 'OVĚŘENO_ECOCROP_V2';

  IF updated_count <> 22 THEN
    RAISE EXCEPTION 'Po DIRECT v2 není aktualizováno 22 profilů, ale %', updated_count;
  END IF;

  RAISE NOTICE 'AEGRIS DIRECT v2 OK: 22 profilů environmentálně doplněno.';
END $$;

COMMIT;

SELECT
  p.profile_key,
  cp.name AS profil,
  cp.min_temperature_c,
  cp.max_temperature_c,
  cp.ph_min,
  cp.ph_max,
  p.temp_abs_min_c,
  p.temp_abs_max_c,
  p.ph_abs_min,
  p.ph_abs_max,
  p.ecocrop_url,
  p.environmental_status
FROM public.aegris_agronomic_profile_provenance_v1 p
JOIN public.crop_profiles cp ON cp.name = p.profile_name
WHERE p.profile_key IN ('asparagus','brussels_sprouts','carrot','castor','eggplant','faba_bean_dry','flax','lentil','millet','onion_dry','onion_green','parsnip','peanut','peas_dry','rapeseed_canola','rice','safflower','spinach','sweet_melon','table_beet','turnip_rutabaga','watermelon')
ORDER BY cp.name;
