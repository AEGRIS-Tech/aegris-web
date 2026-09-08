-- ============================================================================
-- AEGRIS IMPORT_READY AGRONOMICKÉ PROFILY v2
-- Datum: 2026-09-08
-- Jazyk: čeština
-- Rozsah: 134 validovaných DIRECT druhů ÚKZÚZ -> 58 agronomických profilů
--
-- BEZPEČNOST:
-- - idempotentní import (opakované spuštění nevytváří další profily/stage)
-- - před změnou mapování crop_catalog vytvoří trvalou zálohu původních vazeb
-- - environmentální hodnoty jsou doplněny pouze ze zdrojů; EcoCrop annual rainfall není vydáván za sezonní potřebu vody
-- - Kc rozsahy jsou pro současný single-number model odvozeny jako střed intervalu;
--   původní raw hodnota je uložena v provenance tabulce.
-- ============================================================================

BEGIN;

-- 1) Kontrola očekávaného schématu
DO $$
BEGIN
  IF to_regclass('public.crop_profiles') IS NULL THEN
    RAISE EXCEPTION 'Chybí public.crop_profiles';
  END IF;
  IF to_regclass('public.crop_stage_profiles') IS NULL THEN
    RAISE EXCEPTION 'Chybí public.crop_stage_profiles';
  END IF;
  IF to_regclass('public.crop_catalog') IS NULL THEN
    RAISE EXCEPTION 'Chybí public.crop_catalog';
  END IF;
END $$;

-- 2) Provenance: zdrojová metadata mimo provozní tabulky enginu
CREATE TABLE IF NOT EXISTS public.aegris_agronomic_profile_provenance_v1 (
  profile_key text PRIMARY KEY,
  profile_name text NOT NULL,
  czech_name text NOT NULL,
  fao_crop_reference text,
  kc_ini numeric,
  kc_mid numeric,
  kc_end numeric,
  kc_ini_raw text,
  kc_mid_raw text,
  kc_end_raw text,
  root_depth_min_m numeric,
  root_depth_max_m numeric,
  depletion_fraction_p numeric,
  water_need_min_mm numeric,
  water_need_max_mm numeric,
  drought_sensitivity text,
  ecocrop_url text,
  environmental_status text NOT NULL,
  fao56_kc_url text NOT NULL DEFAULT 'https://www.fao.org/4/x0490e/x0490e0b.htm',
  fao56_root_url text NOT NULL DEFAULT 'https://www.fao.org/4/x0490e/x0490e0e.htm',
  fao_crop_water_url text NOT NULL DEFAULT 'https://www.fao.org/4/S2022E/s2022e07.htm',
  ecocrop_info_url text NOT NULL DEFAULT 'https://www.fao.org/geospatial/data-and-tools/data-portals/ecocrop/',
  bbch_reference_url text NOT NULL DEFAULT 'https://gd.eppo.int/reporting/article-6991',
  evidence_type text NOT NULL DEFAULT 'DIRECT',
  confidence text NOT NULL DEFAULT 'high_for_source_backed_fields',
  verified_at date NOT NULL DEFAULT DATE '2026-09-08'
);

CREATE TEMP TABLE aegris_import_profiles (
  profile_key text,
  profile_name text,
  czech_name text,
  min_temperature_c numeric,
  max_temperature_c numeric,
  ph_min numeric,
  ph_max numeric,
  water_need text,
  notes text,
  kc_ini numeric,
  kc_mid numeric,
  kc_end numeric,
  kc_ini_raw text,
  kc_mid_raw text,
  kc_end_raw text,
  root_depth_min_m numeric,
  root_depth_max_m numeric,
  depletion_fraction_p numeric,
  water_need_min_mm numeric,
  water_need_max_mm numeric,
  drought_sensitivity text,
  ecocrop_url text,
  environmental_status text
) ON COMMIT DROP;

INSERT INTO aegris_import_profiles VALUES
('alfalfa','AEGRIS DIRECT · Vojtěška – seno','Vojtěška – seno',21,27,6.5,7.5,'800–1600 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=alfalfa; FAO crop reference=Alfalfa hay (Medicago sativa); Kc raw=0.4/0.95/0.9; root=1.0–2.0 m; depletion p=0.55; seasonal crop-water requirement=800–1600 mm; EcoCrop annual rainfall=600–1200 mm is climate suitability only; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428.',0.4,0.95,0.9,0.4,0.95,0.9,1.0,2.0,0.55,800.0,1600.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428','OVĚŘENO_ECOCROP'),
('almond','AEGRIS DIRECT · Mandloň','Mandloň',12,35,6.5,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=almond; FAO crop reference=Almonds - no ground cover; Kc raw=0.4/0.9/0.65; root=1.0–2.0 m; depletion p=0.4; EcoCrop Prunus amygdalus: optimal annual rainfall=600–900 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2397.',0.4,0.9,0.65,0.4,0.9,0.65,1.0,2.0,0.4,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2397','OVĚŘENO_ECOCROP'),
('apple_cherry_pear','AEGRIS DIRECT · Jabloň / třešeň / hrušeň','Jabloň / třešeň / hrušeň',14,35,5.5,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=apple_cherry_pear; kompozitní profil pro Malus domestica / Prunus avium / Pyrus communis; environmentální interval je obálka EcoCrop optim jednotlivých druhů, nikoli optimum jediné plodiny; Kc raw=0.45/0.95/0.7; root=1.0–2.0 m; depletion p=0.5; EcoCrop IDs=1407,8965,1832.',0.45,0.95,0.7,0.45,0.95,0.7,1.0,2.0,0.5,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1407','OVĚŘENO_ECOCROP_KOMPOZIT'),
('asparagus','AEGRIS DIRECT · Chřest','Chřest',15,30,6.0,6.7,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=asparagus; FAO crop reference=Asparagus; Kc raw=0.5/0.95/0.3; root=1.2–1.8 m; depletion p=0.45; EcoCrop annual rainfall optimum=800–1200 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=468.',0.5,0.95,0.3,0.5,0.95,0.3,1.2,1.8,0.45,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=468','OVĚŘENO_ECOCROP'),
('barley','AEGRIS DIRECT · Ječmen','Ječmen',15,20,6.5,7.5,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=barley; FAO crop reference=Barley; Kc raw=0.3/1.15/0.25; root=1.0–1.5 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232.',0.3,1.15,0.25,0.3,1.15,0.25,1.0,1.5,0.55,450.0,650.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232','OVĚŘENO_ECOCROP'),
('beans_dry_pulses','AEGRIS DIRECT · Fazole – suché zrno / luskoviny','Fazole – suché zrno / luskoviny',16,25,5.5,7.5,'300–500 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=beans_dry_pulses; FAO crop reference=Common bean (Phaseolus vulgaris); Kc raw=0.4/1.15/0.35; root=0.6–0.9 m; depletion p=0.45; seasonal crop-water requirement=300–500 mm; EcoCrop annual rainfall=500–2000 mm is climate suitability only; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1668.',0.4,1.15,0.35,0.4,1.15,0.35,0.6,0.9,0.45,300.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1668','OVĚŘENO_ECOCROP'),
('broccoli','AEGRIS DIRECT · Brokolice','Brokolice',15,24,6,6.8,'350–500 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=broccoli; FAO crop reference=Broccoli; Kc raw=0.7/1.05/0.95; root=0.4–0.6 m; depletion p=0.45; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=556.',0.7,1.05,0.95,0.7,1.05,0.95,0.4,0.6,0.45,350.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=556','OVĚŘENO_ECOCROP'),
('brussels_sprouts','AEGRIS DIRECT · Kapusta růžičková','Kapusta růžičková',12,20,6.0,7.0,'350–500 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=brussels_sprouts; FAO crop reference=Brussel sprouts; Kc raw=0.7/1.05/0.95; root=0.4–0.6 m; depletion p=0.45; seasonal water_need zachováno z FAO crop-water vrstvy; EcoCrop annual rainfall optimum=900–1600 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=555.',0.7,1.05,0.95,0.7,1.05,0.95,0.4,0.6,0.45,350.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=555','OVĚŘENO_ECOCROP'),
('cabbage_crucifer','AEGRIS DIRECT · Zelí / kapusta / brukvovité','Zelí / kapusta / brukvovité',15,24,6,7.5,'350–500 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=cabbage_crucifer; FAO crop reference=Cabbage / crucifers; Kc raw=0.7/1.05/0.95; root=0.5–0.8 m; depletion p=0.45; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=554.',0.7,1.05,0.95,0.7,1.05,0.95,0.5,0.8,0.45,350.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=554','OVĚŘENO_ECOCROP'),
('carrot','AEGRIS DIRECT · Mrkev','Mrkev',15,24,5.8,6.8,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=carrot; FAO crop reference=Carrot (Daucus carota); Kc raw=0.7/1.05/0.95; root=0.5–1.0 m; depletion p=0.35; EcoCrop annual rainfall=600–1200 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=871.',0.7,1.05,0.95,0.7,1.05,0.95,0.5,1.0,0.35,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=871','OVĚŘENO_ECOCROP'),
('castor','AEGRIS DIRECT · Skočec obecný','Skočec obecný',20,30,5.0,6.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=castor; FAO crop reference=Castorbean / Ricinus; Kc raw=0.35/1.15/0.55; root=1.0–2.0 m; depletion p=0.5; EcoCrop annual rainfall optimum=600–1000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1866.',0.35,1.15,0.55,0.35,1.15,0.55,1.0,2.0,0.5,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1866','OVĚŘENO_ECOCROP'),
('cauliflower','AEGRIS DIRECT · Květák','Květák',10,25,6,7,'350–500 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=cauliflower; FAO crop reference=Cauliflower; Kc raw=0.7/1.05/0.95; root=0.4–0.7 m; depletion p=0.45; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=553.',0.7,1.05,0.95,0.7,1.05,0.95,0.4,0.7,0.45,350.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=553','OVĚŘENO_ECOCROP'),
('celery','AEGRIS DIRECT · Celer','Celer',15,21,6,6.8,NULL,'AEGRIS Agronomic Data Layer v1; profil_key=celery; FAO crop reference=Celery; Kc raw=0.7/1.05/1.0; root=0.3–0.5 m; depletion p=0.2; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=431.',0.7,1.05,1.0,0.7,1.05,1.0,0.3,0.5,0.2,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=431','OVĚŘENO_ECOCROP'),
('clover_berseem','AEGRIS DIRECT · Jetel alexandrijský','Jetel alexandrijský',10,25,6.0,8.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=clover_berseem; FAO crop reference=Clover hay / Berseem; Kc raw=0.4/0.9/0.85; root=0.6–0.9 m; depletion p=0.5; environmentální rozsah doplněn z nezávislých agronomických zdrojů pro Trifolium alexandrinum; EcoCrop druh eviduje pod kódem 10522, ale hodnoty nebyly v tomto průchodu použity jako přímý zdroj.',0.4,0.9,0.85,0.4,0.9,0.85,0.6,0.9,0.5,NULL,NULL,'střední až vysoká',NULL,'OVĚŘENO_EXTERNÍ_ZDROJ'),
('cucumber','AEGRIS DIRECT · Okurka','Okurka',18,32,6,7.5,NULL,'AEGRIS Agronomic Data Layer v1; profil_key=cucumber; FAO crop reference=Cucumber - fresh market; Kc raw=0.6/1.0/0.75; root=0.7–1.2 m; depletion p=0.5; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=817.',0.6,1.0,0.75,0.6,1.0,0.75,0.7,1.2,0.5,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=817','OVĚŘENO_ECOCROP'),
('eggplant','AEGRIS DIRECT · Lilek vejcoplodý','Lilek vejcoplodý',20,35,5.5,6.8,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=eggplant; FAO crop reference=Egg plant; Kc raw=0.6/1.05/0.9; root=0.7–1.2 m; depletion p=0.45; EcoCrop annual rainfall optimum=1200–1600 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1965.',0.6,1.05,0.9,0.6,1.05,0.9,0.7,1.2,0.45,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1965','OVĚŘENO_ECOCROP'),
('faba_bean_dry','AEGRIS DIRECT · Bob – suché zrno','Bob – suché zrno',18,28,6.0,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=faba_bean_dry; FAO crop reference=Faba bean (Vicia faba); Kc raw=0.5/1.15/0.3; root=0.5–0.7 m; depletion p=0.45; EcoCrop annual rainfall=650–1000 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146.',0.5,1.15,0.3,0.5,1.15,0.3,0.5,0.7,0.45,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146','OVĚŘENO_ECOCROP'),
('flax','AEGRIS DIRECT · Len','Len',16,24,6.0,6.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=flax; FAO crop reference=Flax / linseed (Linum usitatissimum); Kc raw=0.35/1.1/0.25; root=1.0–1.5 m; depletion p=0.5; EcoCrop annual rainfall=500–800 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7336.',0.35,1.1,0.25,0.35,1.1,0.25,1.0,1.5,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7336','OVĚŘENO_ECOCROP'),
('garlic','AEGRIS DIRECT · Česnek','Česnek',18,30,6,6.6,NULL,'AEGRIS Agronomic Data Layer v1; profil_key=garlic; FAO crop reference=Garlic; Kc raw=0.7/1.0/0.7; root=0.3–0.5 m; depletion p=0.3; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=367.',0.7,1.0,0.7,0.7,1.0,0.7,0.3,0.5,0.3,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=367','OVĚŘENO_ECOCROP'),
('hops','AEGRIS DIRECT · Chmel','Chmel',15,19,5.5,6.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=hops; FAO crop reference=Hops (Humulus lupulus); Kc raw=0.3/1.05/0.85; root=1.0–1.2 m; depletion p=0.5; EcoCrop annual rainfall=400–700 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=6779.',0.3,1.05,0.85,0.3,1.05,0.85,1.0,1.2,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=6779','OVĚŘENO_ECOCROP'),
('lentil','AEGRIS DIRECT · Čočka','Čočka',15,29,5.5,7.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=lentil; FAO crop reference=Lentil (Lens culinaris); Kc raw=0.4/1.1/0.3; root=0.6–0.8 m; depletion p=0.5; EcoCrop annual rainfall=600–1000 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7209.',0.4,1.1,0.3,0.4,1.1,0.3,0.6,0.8,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7209','OVĚŘENO_ECOCROP'),
('lettuce','AEGRIS DIRECT · Salát','Salát',12,21,6,7,NULL,'AEGRIS Agronomic Data Layer v1; profil_key=lettuce; FAO crop reference=Lettuce; Kc raw=0.7/1.0/0.95; root=0.3–0.5 m; depletion p=0.3; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1313.',0.7,1.0,0.95,0.7,1.0,0.95,0.3,0.5,0.3,NULL,NULL,NULL,'https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1313','OVĚŘENO_ECOCROP'),
('maize_field','AEGRIS DIRECT · Kukuřice polní','Kukuřice polní',18,33,5,7,'500–800 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=maize_field; FAO crop reference=Maize - field/grain; Kc raw=0.3/1.2/0.60-0.35; root=1.0–1.7 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175.',0.3,1.2,0.475,0.3,1.2,'0.60-0.35',1.0,1.7,0.55,500.0,800.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175','OVĚŘENO_ECOCROP'),
('maize_sweet','AEGRIS DIRECT · Kukuřice cukrová','Kukuřice cukrová',18,33,5,7,'500–800 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=maize_sweet; FAO crop reference=Maize - sweet; Kc raw=0.3/1.15/1.05; root=0.8–1.2 m; depletion p=0.5; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=238663.',0.3,1.15,1.05,0.3,1.15,1.05,0.8,1.2,0.5,500.0,800.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=238663','OVĚŘENO_ECOCROP'),
('millet','AEGRIS DIRECT · Proso','Proso',20,32,6.0,6.5,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=millet; FAO crop reference=Proso millet (Panicum miliaceum); Kc raw=0.3/1.0/0.3; root=1.0–2.0 m; depletion p=0.55; seasonal crop-water requirement=450–650 mm; EcoCrop annual rainfall=500–750 mm is climate suitability only; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=8280.',0.3,1.0,0.3,0.3,1.0,0.3,1.0,2.0,0.55,450.0,650.0,'nízká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=8280','OVĚŘENO_ECOCROP'),
('mint','AEGRIS DIRECT · Máta','Máta',15,25,5.5,6.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=mint; reprezentativní EcoCrop reference=Mentha piperita; Kc raw=0.6/1.15/1.1; root=0.4–0.8 m; depletion p=0.4; EcoCrop annual rainfall optimum=1000–2200 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2099.',0.6,1.15,1.1,0.6,1.15,1.1,0.4,0.8,0.4,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2099','OVĚŘENO_ECOCROP_REPREZENTATIVNÍ'),
('oats','AEGRIS DIRECT · Oves','Oves',16,20,5,6,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=oats; FAO crop reference=Oats; Kc raw=0.3/1.15/0.25; root=1.0–1.5 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481.',0.3,1.15,0.25,0.3,1.15,0.25,1.0,1.5,0.55,450.0,650.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481','OVĚŘENO_ECOCROP'),
('onion_dry','AEGRIS DIRECT · Cibule suchá','Cibule suchá',12,25,6.0,7.0,'350–550 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=onion_dry; FAO crop reference=Onion (Allium cepa); Kc raw=0.7/1.05/0.75; root=0.3–0.6 m; depletion p=0.3; seasonal crop-water requirement=350–550 mm; EcoCrop annual rainfall=350–600 mm is climate suitability only; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=364.',0.7,1.05,0.75,0.7,1.05,0.75,0.3,0.6,0.3,350.0,550.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=364','OVĚŘENO_ECOCROP'),
('onion_green','AEGRIS DIRECT · Cibule naťová','Cibule naťová',12,25,6.6,7.4,'350–550 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=onion_green; FAO crop reference=Onion - green / Allium fistulosum; Kc raw=0.7/1.0/1.0; root=0.3–0.6 m; depletion p=0.3; seasonal water_need zachováno z FAO crop-water vrstvy; EcoCrop annual rainfall optimum=850–1600 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=365.',0.7,1.0,1.0,0.7,1.0,1.0,0.3,0.6,0.3,350.0,550.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=365','OVĚŘENO_ECOCROP'),
('parsnip','AEGRIS DIRECT · Pastinák','Pastinák',15,21,6.0,6.8,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=parsnip; FAO crop reference=Parsnip / Pastinaca sativa; Kc raw=0.5/1.05/0.95; root=0.5–1.0 m; depletion p=0.4; EcoCrop annual rainfall optimum=500–800 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1642.',0.5,1.05,0.95,0.5,1.05,0.95,0.5,1.0,0.4,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1642','OVĚŘENO_ECOCROP'),
('peanut','AEGRIS DIRECT · Podzemnice olejná','Podzemnice olejná',22,32,5.5,6.5,'500–700 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=peanut; FAO crop reference=Groundnut / peanut; Kc raw=0.4/1.15/0.6; root=0.5–1.0 m; depletion p=0.5; seasonal water_need zachováno z FAO crop-water vrstvy; EcoCrop annual rainfall optimum=600–1500 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2199.',0.4,1.15,0.6,0.4,1.15,0.6,0.5,1.0,0.5,500.0,700.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2199','OVĚŘENO_ECOCROP'),
('peas_dry','AEGRIS DIRECT · Hrách – suché zrno','Hrách – suché zrno',10,24,5.5,7.0,'350–500 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=peas_dry; FAO crop reference=Peas - dry/seed (Pisum sativum); Kc raw=0.4/1.15/0.3; root=0.6–1.0 m; depletion p=0.4; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721.',0.4,1.15,0.3,0.4,1.15,0.3,0.6,1.0,0.4,350.0,500.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721','OVĚŘENO_ECOCROP'),
('pepper','AEGRIS DIRECT · Paprika','Paprika',17,30,5.5,6.8,'600–900 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=pepper; FAO crop reference=Sweet peppers / Capsicum annuum; Kc raw=0.6/1.05/0.9; root=0.5–1.0 m; depletion p=0.3; seasonal water_need zachováno z FAO crop-water vrstvy; EcoCrop annual rainfall optimum=600–1250 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=618.',0.6,1.05,0.9,0.6,1.05,0.9,0.5,1.0,0.3,600.0,900.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=618','OVĚŘENO_ECOCROP'),
('potato','AEGRIS DIRECT · Brambory','Brambory',15,25,5,6.2,'500–700 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=potato; FAO crop reference=Potato; Kc raw=0.5/1.15/0.75; root=0.4–0.6 m; depletion p=0.35; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971.',0.5,1.15,0.75,0.5,1.15,0.75,0.4,0.6,0.35,500.0,700.0,'vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971','OVĚŘENO_ECOCROP'),
('pumpkin_winter_squash','AEGRIS DIRECT · Tykev / dýně','Tykev / dýně',20,30,5.5,7.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=pumpkin_winter_squash; reprezentativní EcoCrop reference=Cucurbita maxima; Kc raw=0.5/1.0/0.8; root=1.0–1.5 m; depletion p=0.35; EcoCrop annual rainfall optimum=600–1000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=819.',0.5,1.0,0.8,0.5,1.0,0.8,1.0,1.5,0.35,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=819','OVĚŘENO_ECOCROP_REPREZENTATIVNÍ'),
('radish','AEGRIS DIRECT · Ředkev / ředkvička','Ředkev / ředkvička',12,25,6.0,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=radish; EcoCrop reference=Raphanus sativus var. radicula; Kc raw=0.7/0.9/0.85; root=0.3–0.5 m; depletion p=0.3; EcoCrop annual rainfall optimum=800–1000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=11291.',0.7,0.9,0.85,0.7,0.9,0.85,0.3,0.5,0.3,NULL,NULL,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=11291','OVĚŘENO_ECOCROP_REPREZENTATIVNÍ'),
('rapeseed_canola','AEGRIS DIRECT · Řepka','Řepka',15,25,6.5,7.6,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=rapeseed_canola; FAO crop reference=Rapeseed / canola (Brassica napus); Kc raw=0.35/1.00-1.15/0.35; root=1.0–1.5 m; depletion p=0.6; EcoCrop annual rainfall=500–1000 mm is climate suitability only and is NOT stored as seasonal water_need; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=549.',0.35,1.075,0.35,0.35,'1.00-1.15',0.35,1.0,1.5,0.6,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=549','OVĚŘENO_ECOCROP'),
('rice','AEGRIS DIRECT · Rýže','Rýže',20,30,5.5,7.0,'450–700 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=rice; FAO crop reference=Rice / Oryza sativa; Kc raw=1.05/1.2/0.90-0.60; root=0.5–1.0 m; depletion p=0.2; seasonal crop-water figure is retained separately from EcoCrop climate suitability; EcoCrop annual rainfall optimum=1500–2000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1574.',1.05,1.2,0.75,1.05,1.2,'0.90-0.60',0.5,1.0,0.2,450.0,700.0,'vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1574','OVĚŘENO_ECOCROP'),
('ryegrass_hay','AEGRIS DIRECT · Jílek / travní píce','Jílek / travní píce',14,25,5.0,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=ryegrass_hay; reprezentativní EcoCrop reference=Lolium perenne; Kc raw=0.95/1.05/1.0; root=0.6–1.0 m; depletion p=0.6; EcoCrop annual rainfall optimum=700–1750 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1362.',0.95,1.05,1.0,0.95,1.05,1.0,0.6,1.0,0.6,NULL,NULL,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1362','OVĚŘENO_ECOCROP_REPREZENTATIVNÍ'),
('safflower','AEGRIS DIRECT · Světlice barvířská','Světlice barvířská',20,32,6.5,7.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=safflower; FAO crop reference=Safflower / Carthamus tinctorius; Kc raw=0.35/1.00-1.15/0.25; root=1.0–2.0 m; depletion p=0.6; EcoCrop annual rainfall optimum=600–1000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2514.',0.35,1.075,0.25,0.35,'1.00-1.15',0.25,1.0,2.0,0.6,NULL,NULL,'nízká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2514','OVĚŘENO_ECOCROP'),
('sorghum_grain','AEGRIS DIRECT · Čirok zrnový','Čirok zrnový',22,35,5.5,7.5,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=sorghum_grain; FAO crop reference=Sorghum - grain / Sorghum bicolor; Kc raw=0.3/1.00-1.10/0.55; root=1.0–2.0 m; depletion p=0.55; seasonal water_need zachováno z crop-water vrstvy; EcoCrop annual rainfall optimum=400–600 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=48747.',0.3,1.05,0.55,0.3,'1.00-1.10',0.55,1.0,2.0,0.55,450.0,650.0,'nízká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=48747','OVĚŘENO_ECOCROP'),
('sorghum_sweet','AEGRIS DIRECT · Čirok cukrový','Čirok cukrový',22,35,5.5,7.5,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=sorghum_sweet; FAO crop reference=Sorghum - sweet; Kc raw=0.3/1.2/1.05; root=1.0–2.0 m; depletion p=0.5; environmentální interval používá druhový EcoCrop profil Sorghum bicolor, sweet-sorghum reference=EcoCrop 1982; seasonal water_need zachováno z crop-water vrstvy.',0.3,1.2,1.05,0.3,1.2,1.05,1.0,2.0,0.5,450.0,650.0,'nízká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=48747','OVĚŘENO_ECOCROP_DRUHOVÝ_PROFIL'),
('soybean','AEGRIS DIRECT · Sója','Sója',20,33,5.5,6.5,'450–700 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=soybean; FAO crop reference=Soybeans; Kc raw=0.4/1.15/0.5; root=0.6–1.3 m; depletion p=0.5; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1150.',0.4,1.15,0.5,0.4,1.15,0.5,0.6,1.3,0.5,450.0,700.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1150','OVĚŘENO_ECOCROP'),
('spinach','AEGRIS DIRECT · Špenát','Špenát',13,20,6.0,7.5,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=spinach; FAO crop reference=Spinach / Spinacia oleracea; Kc raw=0.7/1.0/0.95; root=0.3–0.5 m; depletion p=0.2; EcoCrop annual rainfall optimum=800–1200 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1997.',0.7,1.0,0.95,0.7,1.0,0.95,0.3,0.5,0.2,NULL,NULL,'vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1997','OVĚŘENO_ECOCROP'),
('spring_wheat','AEGRIS DIRECT · Pšenice jarní','Pšenice jarní',15,23,6,7,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=spring_wheat; FAO crop reference=Spring wheat; Kc raw=0.3/1.15/0.25-0.40; root=1.0–1.5 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114.',0.3,1.15,0.325,0.3,1.15,'0.25-0.40',1.0,1.5,0.55,450.0,650.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114','OVĚŘENO_ECOCROP'),
('stone_fruit','AEGRIS DIRECT · Broskvoň / meruňka / slivoň','Broskvoň / meruňka / slivoň',14,35,5.5,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=stone_fruit; kompozitní profil Prunus persica / Prunus armeniaca / Prunus domestica; environmentální rozsah je obálka EcoCrop optim jednotlivých druhů; Kc raw=0.45/0.9/0.65; root=1.0–2.0 m; depletion p=0.5; EcoCrop IDs=1796,2398,16203.',0.45,0.9,0.65,0.45,0.9,0.65,1.0,2.0,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1796','OVĚŘENO_ECOCROP_KOMPOZIT'),
('strawberry','AEGRIS DIRECT · Jahodník','Jahodník',11,24,6.0,6.8,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=strawberry; reprezentativní EcoCrop reference=Fragaria x ananassa; Kc raw=0.4/0.85/0.75; root=0.2–0.3 m; depletion p=0.2; EcoCrop annual rainfall optimum=600–900 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1112.',0.4,0.85,0.75,0.4,0.85,0.75,0.2,0.3,0.2,NULL,NULL,'vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1112','OVĚŘENO_ECOCROP_REPREZENTATIVNÍ'),
('sugar_beet','AEGRIS DIRECT · Cukrová řepa','Cukrová řepa',15,25,6,6.8,'550–750 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=sugar_beet; FAO crop reference=Sugar beet; Kc raw=0.35/1.2/0.7; root=0.7–1.2 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=48742.',0.35,1.2,0.7,0.35,1.2,0.7,0.7,1.2,0.55,550.0,750.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=48742','OVĚŘENO_ECOCROP'),
('sunflower','AEGRIS DIRECT · Slunečnice','Slunečnice',17,34,6,7.5,'600–1000 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=sunflower; FAO crop reference=Sunflower; Kc raw=0.35/1.00-1.15/0.35; root=0.8–1.5 m; depletion p=0.45; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1191.',0.35,1.075,0.35,0.35,'1.00-1.15',0.35,0.8,1.5,0.45,600.0,1000.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1191','OVĚŘENO_ECOCROP'),
('sweet_melon','AEGRIS DIRECT · Meloun cukrový','Meloun cukrový',18,30,6.0,7.5,'400–600 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=sweet_melon; FAO crop reference=Sweet melons / Cucumis melo; Kc raw=0.5/1.05/0.75; root=0.8–1.5 m; depletion p=0.4; seasonal water_need zachováno z crop-water vrstvy; EcoCrop annual rainfall optimum=1000–1300 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=815.',0.5,1.05,0.75,0.5,1.05,0.75,0.8,1.5,0.4,400.0,600.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=815','OVĚŘENO_ECOCROP'),
('table_beet','AEGRIS DIRECT · Řepa salátová','Řepa salátová',15,25,6.0,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=table_beet; druhový EcoCrop reference=Beta vulgaris; Kc raw=0.5/1.05/0.95; root=0.6–1.0 m; depletion p=0.5; EcoCrop annual rainfall optimum=600–800 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=514.',0.5,1.05,0.95,0.5,1.05,0.95,0.6,1.0,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=514','OVĚŘENO_ECOCROP_DRUHOVÝ_PROFIL'),
('tomato','AEGRIS DIRECT · Rajče','Rajče',20,27,5.5,6.8,'400–800 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=tomato; FAO crop reference=Tomato / Solanum lycopersicum (EcoCrop synonym Lycopersicon esculentum); Kc raw=0.6/1.15/0.70-0.90; root=0.7–1.5 m; depletion p=0.4; seasonal water_need zachováno z crop-water vrstvy; EcoCrop annual rainfall optimum=600–1300 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1379.',0.6,1.15,0.8,0.6,1.15,'0.70-0.90',0.7,1.5,0.4,400.0,800.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1379','OVĚŘENO_ECOCROP'),
('turnip_rutabaga','AEGRIS DIRECT · Tuřín','Tuřín',14,24,5.5,7.0,NULL,'AEGRIS Agronomic Data Layer v2; profil_key=turnip_rutabaga; EcoCrop reference=Brassica napus var. napobrassica; Kc raw=0.5/1.1/0.95; root=0.5–1.0 m; depletion p=0.5; EcoCrop annual rainfall optimum=700–1000 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=3861.',0.5,1.1,0.95,0.5,1.1,0.95,0.5,1.0,0.5,NULL,NULL,'střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=3861','OVĚŘENO_ECOCROP'),
('watermelon','AEGRIS DIRECT · Meloun vodní','Meloun vodní',20,35,6.0,7.0,'400–600 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=watermelon; FAO crop reference=Watermelon / Citrullus lanatus; Kc raw=0.4/1.0/0.75; root=0.8–1.5 m; depletion p=0.4; seasonal water_need zachováno z crop-water vrstvy; EcoCrop annual rainfall optimum=500–700 mm; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=708.',0.4,1.0,0.75,0.4,1.0,0.75,0.8,1.5,0.4,400.0,600.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=708','OVĚŘENO_ECOCROP'),
('rye_cereal','AEGRIS DIRECT · Žito','Žito',15,20,5.5,6.0,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=rye_cereal; FAO/EcoCrop reference=Rye (Secale cereale); EcoCrop optimal annual rainfall=600–1000 mm (climate suitability, NOT seasonal water_need); Kc=0.3/1.15/0.25 is FAO-56 small-grain analogue aligned with current AEGRIS barley/oats model; root=1.0–1.5 m; depletion p=0.55; UKZUZ codes=5 winter,561 spring; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1929.',0.3,1.15,0.25,0.3,1.15,0.25,1.0,1.5,0.55,450.0,650.0,'nízká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1929','OVĚŘENO_ECOCROP_KC_ANALOG_FAO56'),
('triticale_cereal','AEGRIS DIRECT · Tritikale','Tritikale',15,23,5.5,7.0,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=triticale_cereal; UKZUZ scientific reference=x Triticosecale Wittm. ex A. Camus; direct EcoCrop environmental profile is not used because a sufficiently specific Triticosecale datasheet was not established; environmental envelope follows rye/wheat parent agronomy; Kc=0.3/1.15/0.4 is FAO-56 small-grain analogue; an independent triticale field study reports Kc ini/mid/end=0.45/1.22/0.49, supporting the same magnitude; root=1.0–1.5 m; depletion p=0.55; UKZUZ codes=8 winter,447 spring.',0.3,1.15,0.4,0.3,1.15,0.4,1.0,1.5,0.55,450.0,650.0,'nízká až střední',NULL,'OVĚŘENO_UKZUZ_FAO56_ANALOG_EMPIRIE'),
('poppy_seed','AEGRIS DIRECT · Mák setý','Mák setý',15,24,6.5,7.5,'398–505 mm za vegetaci','AEGRIS Agronomic Data Layer v2; profil_key=poppy_seed; FAO/EcoCrop reference=Papaver somniferum; EcoCrop optimal annual rainfall=800–1200 mm (climate suitability, NOT seasonal water_need); published seasonal ET=398–505 mm; Kc=0.35/1.05/0.35 is explicitly an FAO-56 oilseed-class analogue because no direct FAO-56 poppy Kc table value was established; root=0.5–1.0 m from EcoCrop crop description, with published evidence of deeper water uptake under field conditions; depletion p=0.5 analogue; UKZUZ codes=25 spring,452 winter; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=8296.',0.35,1.05,0.35,0.35,1.05,0.35,0.5,1.0,0.5,398.0,505.0,'střední až vysoká','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=8296','OVĚŘENO_ECOCROP_ET_KC_ANALOG_FAO56'),
('winter_wheat','AEGRIS DIRECT · Pšenice ozimá','Pšenice ozimá',15,23,6,7,'450–650 mm za vegetaci','AEGRIS Agronomic Data Layer v1; profil_key=winter_wheat; FAO crop reference=Winter wheat; Kc raw=0.40-0.70/1.15/0.25-0.40; root=1.5–1.8 m; depletion p=0.55; ECOCROP=https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114.',0.55,1.15,0.325,'0.40-0.70',1.15,'0.25-0.40',1.5,1.8,0.55,450.0,650.0,'nízká až střední','https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114','OVĚŘENO_ECOCROP');

DO $$
DECLARE
  c integer;
BEGIN
  SELECT count(*) INTO c FROM aegris_import_profiles;
  IF c <> 58 THEN
    RAISE EXCEPTION 'Import čekal 58 profilů, ale našel %', c;
  END IF;
END $$;

INSERT INTO public.aegris_agronomic_profile_provenance_v1 (
  profile_key, profile_name, czech_name, fao_crop_reference,
  kc_ini, kc_mid, kc_end, kc_ini_raw, kc_mid_raw, kc_end_raw,
  root_depth_min_m, root_depth_max_m, depletion_fraction_p,
  water_need_min_mm, water_need_max_mm, drought_sensitivity,
  ecocrop_url, environmental_status
)
SELECT
  profile_key, profile_name, czech_name, NULL,
  kc_ini, kc_mid, kc_end, kc_ini_raw, kc_mid_raw, kc_end_raw,
  root_depth_min_m, root_depth_max_m, depletion_fraction_p,
  water_need_min_mm, water_need_max_mm, drought_sensitivity,
  ecocrop_url, environmental_status
FROM aegris_import_profiles
ON CONFLICT (profile_key) DO UPDATE SET
  profile_name = EXCLUDED.profile_name,
  czech_name = EXCLUDED.czech_name,
  kc_ini = EXCLUDED.kc_ini,
  kc_mid = EXCLUDED.kc_mid,
  kc_end = EXCLUDED.kc_end,
  kc_ini_raw = EXCLUDED.kc_ini_raw,
  kc_mid_raw = EXCLUDED.kc_mid_raw,
  kc_end_raw = EXCLUDED.kc_end_raw,
  root_depth_min_m = EXCLUDED.root_depth_min_m,
  root_depth_max_m = EXCLUDED.root_depth_max_m,
  depletion_fraction_p = EXCLUDED.depletion_fraction_p,
  water_need_min_mm = EXCLUDED.water_need_min_mm,
  water_need_max_mm = EXCLUDED.water_need_max_mm,
  drought_sensitivity = EXCLUDED.drought_sensitivity,
  ecocrop_url = EXCLUDED.ecocrop_url,
  environmental_status = EXCLUDED.environmental_status,
  verified_at = DATE '2026-09-08';

-- 3) Vložit provozní crop_profiles.
-- Používáme pouze sloupce, které AegRIS aktuálně čte.
INSERT INTO public.crop_profiles (
  name,
  category,
  min_temperature_c,
  max_temperature_c,
  soil_moisture_min_pct,
  soil_moisture_max_pct,
  ph_min,
  ph_max,
  water_need,
  light_need,
  notes
)
SELECT
  p.profile_name,
  'AEGRIS DIRECT v2',
  p.min_temperature_c,
  p.max_temperature_c,
  NULL,
  NULL,
  p.ph_min,
  p.ph_max,
  p.water_need,
  NULL,
  p.notes
FROM aegris_import_profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.crop_profiles cp WHERE cp.name = p.profile_name
);

-- Aktualizovat pouze source-backed hodnoty; NULL z importu nepřepisuje existující údaj.
UPDATE public.crop_profiles cp
SET
  category = 'AEGRIS DIRECT v2',
  min_temperature_c = COALESCE(p.min_temperature_c, cp.min_temperature_c),
  max_temperature_c = COALESCE(p.max_temperature_c, cp.max_temperature_c),
  ph_min = COALESCE(p.ph_min, cp.ph_min),
  ph_max = COALESCE(p.ph_max, cp.ph_max),
  water_need = COALESCE(p.water_need, cp.water_need),
  notes = p.notes
FROM aegris_import_profiles p
WHERE cp.name = p.profile_name;

-- 4) Kc stage profily. Tři bezpečné kotevní fáze:
--    initial -> Klíčení a vzcházení
--    mid     -> Kvetení / opylení
--    end     -> Dozrávání
CREATE TEMP TABLE aegris_stage_import AS
SELECT profile_key, profile_name, 'Klíčení a vzcházení'::text AS growth_stage,
       kc_ini AS kc, min_temperature_c, max_temperature_c, drought_sensitivity
FROM aegris_import_profiles WHERE kc_ini IS NOT NULL
UNION ALL
SELECT profile_key, profile_name, 'Kvetení / opylení',
       kc_mid, min_temperature_c, max_temperature_c, drought_sensitivity
FROM aegris_import_profiles WHERE kc_mid IS NOT NULL
UNION ALL
SELECT profile_key, profile_name, 'Dozrávání',
       kc_end, min_temperature_c, max_temperature_c, drought_sensitivity
FROM aegris_import_profiles WHERE kc_end IS NOT NULL;

INSERT INTO public.crop_stage_profiles (
  crop_profile_id,
  growth_stage,
  kc,
  min_temperature_c,
  max_temperature_c,
  water_stress_sensitivity
)
SELECT
  cp.id,
  s.growth_stage,
  s.kc,
  s.min_temperature_c,
  s.max_temperature_c,
  s.drought_sensitivity
FROM aegris_stage_import s
JOIN public.crop_profiles cp ON cp.name = s.profile_name
WHERE NOT EXISTS (
  SELECT 1
  FROM public.crop_stage_profiles csp
  WHERE csp.crop_profile_id = cp.id
    AND csp.growth_stage = s.growth_stage
);

UPDATE public.crop_stage_profiles csp
SET
  kc = s.kc,
  min_temperature_c = COALESCE(s.min_temperature_c, csp.min_temperature_c),
  max_temperature_c = COALESCE(s.max_temperature_c, csp.max_temperature_c),
  water_stress_sensitivity = COALESCE(s.drought_sensitivity, csp.water_stress_sensitivity)
FROM aegris_stage_import s
JOIN public.crop_profiles cp ON cp.name = s.profile_name
WHERE csp.crop_profile_id = cp.id
  AND csp.growth_stage = s.growth_stage;

-- 5) Přesné mapování 134 ÚKZÚZ druhů
CREATE TEMP TABLE aegris_species_mapping (
  external_code text,
  czech_species_name text,
  scientific_name text,
  profile_key text
) ON COMMIT DROP;

INSERT INTO aegris_species_mapping VALUES
('1','pšenice setá ozimá','Triticum aestivum L. subsp. aestivum','winter_wheat'),
('10','oves nahý','Avena nuda L.','oats'),
('100','chřest','Asparagus officinalis L.','asparagus'),
('101','kadeřávek','Brassica oleracea L.','cabbage_crucifer'),
('102','pšenice setá x pšenice indická kulatozrnná','Triticum aestivum L. subsp. aestivum x Triticum aestivum L. subsp. sphaerococcum (Percival) Mackey','spring_wheat'),
('103','paprika - hybrid druhů Capsicum annuum a Capsicum chinense','Capsicum annuum L. x Capsicum chinense Jacq.','pepper'),
('104','rajče - hybrid druhů Solanum lycopersicum a Solanum habrochaites','Solanum lycopersicum L. x Solanum habrochaites S. Knapp & D.M. Spooner','tomato'),
('107','kukuřice cukrová','Zea mays L.','maize_sweet'),
('108','kukuřice pukancová','Zea mays L.','maize_field'),
('109','květák','Brassica oleracea L. convar. botrytis (L.) Alef. var. botrytis','cauliflower'),
('11','proso seté','Panicum miliaceum L.','millet'),
('110','lilek vejcoplodý','Solanum melongena L.','eggplant'),
('112','meloun cukrový','Cucumis melo L.','sweet_melon'),
('113','meloun vodní','Citrullus lanatus (Thunb.) Matsum . et Nakai','watermelon'),
('115','okurka nakládačka','Cucumis sativus L.','cucumber'),
('116','okurka salátová','Cucumis sativus  L.','cucumber'),
('117','okurka skleníková','','cucumber'),
('118','paprika','Capsicum annuum L.','pepper'),
('122','zelí pekingské','Brassica rapa L.','cabbage_crucifer'),
('126','mrkev','Daucus  carota L.','carrot'),
('129','kapusta hlávková','Brassica oleracea L.','cabbage_crucifer'),
('13','kukuřice','Zea mays L.','maize_field'),
('130','kapusta růžičková','Brassica oleracea L.','brussels_sprouts'),
('131','kapusta hlávková ozimá','Brassica oleracea L.','cabbage_crucifer'),
('132','pastinák','Pastinaca sativa L.','parsnip'),
('136','rajče','Solanum lycopersicum L.','tomato'),
('137','rajče.','Solanum lycopersicum L.','tomato'),
('139','ředkev','Raphanus sativus L. var. niger (Mill.) S. Kerner','radish'),
('14','bob polní','Vicia faba L.','faba_bean_dry'),
('140','ředkvička','Raphanus sativus L.','radish'),
('142','řepa salátová','Beta vulgaris L.','table_beet'),
('148','špenát setý','Spinacia oleracea L.','spinach'),
('15','čočka jedlá','Lens culinaris Medik.','lentil'),
('152','tuřín','Brassica napus L.var.napobrassica(L.)Rchb.','turnip_rutabaga'),
('153','tykev fíkolistá','Cucurbita  ficifolia C.Bouché','pumpkin_winter_squash'),
('154','tykev velkoplodá','Cucurbita maxima Duchesne','pumpkin_winter_squash'),
('16','fazol obecný','Phaseolus vulgaris L.','beans_dry_pulses'),
('160','fazol šarlatový','Phaseolus coccineus L.','beans_dry_pulses'),
('161','zelí hlávkové bílé','Brassica oleracea L.','cabbage_crucifer'),
('162','fazol obecný keříčkový','Phaseolus vulgaris L.','beans_dry_pulses'),
('163','fazol obecný pnoucí','Phaseolus vulgaris L.','beans_dry_pulses'),
('164','hrách zahradní dřeňový','Pisum sativum L.','peas_dry'),
('165','česnek','Allium sativum L.','garlic'),
('167','česnek jarní','Allium sativum L.','garlic'),
('17','hrách polní jarní','Pisum sativum L. (partim)','peas_dry'),
('175','jahodník měsíční','','strawberry'),
('18','peluška jarní','Pisum sativum L.','peas_dry'),
('2','pšenice tvrdá ozimá','Triticum turgidum L. subsp. durum (Desf.) van Slageren','winter_wheat'),
('24','len olejný','Linum usitatissimum L.','flax'),
('251','Phaseolus coccineus','','beans_dry_pulses'),
('256','Ricinus communis','','castor'),
('26','řepka ozimá','Brassica napus L. (partim)','rapeseed_canola'),
('27','řepka jarní','Brassica napus L. (partim)','rapeseed_canola'),
('28','slunečnice','Helianthus annuus L.','sunflower'),
('29','sója','Glycine max (L.)  Merr.','soybean'),
('3','pšenice setá jarní','Triticum aestivum L. subsp. aestivum','spring_wheat'),
('30','len přadný','Linum usitatissimum  L.','flax'),
('362','Máta klasnatá','','mint'),
('363','Máta peprná','','mint'),
('4','pšenice tvrdá jarní','Triticum turgidum L. subsp. durum (Desf.) van Slageren','spring_wheat'),
('40','vojtěška setá','Medicago sativa L.','alfalfa'),
('409','světlice barvířská','Carthamus tinctorius L.','safflower'),
('416','celer řapíkatý','Apium graveolens L.','celery'),
('418','čirok obecný','Sorghum bicolor (L.) Moench subsp. bicolor','sorghum_grain'),
('419','tykev obecná','Cucurbita pepo L.','pumpkin_winter_squash'),
('420','zelí čínské','Brassica chinensis L.','cabbage_crucifer'),
('423','jetel alexandrijský','Trifolium alexandrinum L.','clover_berseem'),
('435','salát listový','Lactuca sativa L.','lettuce'),
('436','peluška ozimá','Pisum sativum L.','peas_dry'),
('437','hrách polní ozimý','Pisum sativum L. (partim)','peas_dry'),
('438','jílek mnohokvětý x kostřava rákosovitá','xFestulolium Asch. & Graebn.','ryegrass_hay'),
('44','jílek hybridní','Lolium x hybridum Hausskn.','ryegrass_hay'),
('441','tykev - hybrid druhů Cucurbita maxima a Cucurbita moschata (podnož)','Cucurbita maxima Duchesne x Cucurbita moschata Duchesne','pumpkin_winter_squash'),
('446','salát','Lactuca sativa L.','lettuce'),
('45','jílek mnohokvětý (jednoletý)','Lolium multiflorum Lam. ssp.westerwoldicum','ryegrass_hay'),
('451','pšenice špalda jarní','Triticum aestivum L. subsp. spelta (L.) Thell.','spring_wheat'),
('454','pšenice špalda ozimá','Triticum aestivum L. subsp. spelta (L.) Thell.','winter_wheat'),
('456','Festulolium','xFestulolium Asch. & Graebn.','ryegrass_hay'),
('457','hrách zahradní cukrový','Pisum sativum L.','peas_dry'),
('46','jílek mnohokvětý','Lolium multiflorum Lam. ssp. italicum','ryegrass_hay'),
('47','jílek vytrvalý','Lolium perenne L.','ryegrass_hay'),
('476','Fragaria Vesca','','strawberry'),
('482','jílek mnohokvětý x kostřava luční','xFestulolium Asch. & Graebn.','ryegrass_hay'),
('485','salát římský','','lettuce'),
('486','zelí hlávkové červené','Brassica oleracea L.','cabbage_crucifer'),
('488','oves setý ozimý','Avena sativa L.','oats'),
('489','čirok x čirok súdánská tráva','Sorghum bicolor (L.) Moench subsp. bicolor x Sorghum bicolor (L.) Moench subsp. drummondii (Steud.) de Wet ex Davidse','sorghum_grain'),
('491','broskvoň','Prunus persica (L.) Batsch','stone_fruit'),
('492','hrušeň','Pyrus L.','apple_cherry_pear'),
('493','jabloň','Malus Mill.','apple_cherry_pear'),
('495','mandloň','Prunus amygdalus Batsch','almond'),
('498','meruňka','Prunus armeniaca L.','stone_fruit'),
('500','slivoň','Prunus domeatica L.','stone_fruit'),
('501','třešeň','Prunus avium (L.) L.','apple_cherry_pear'),
('513','chmel','','hops'),
('514','broskvomandloň','Prunus sp.','almond'),
('515','paprika EHM','Capsicum annuum L.','pepper'),
('516','rajče EHM','Solanum lycopersicum L.','tomato'),
('517','kukuřice EHM','Zea mays L.','maize_field'),
('518','lilek vejcoplodý EHM','Solanum melongena L.','eggplant'),
('558','cibule sečka','Allium fistulosum L.','onion_green'),
('562','vojtěška proměnlivá','Medicago x varia T. Martyn','alfalfa'),
('564','pšenice dvouzrnka','Triticum turgidum L. subsp. dicoccum (Schrank ex Schübl.) Thell.','spring_wheat'),
('565','pšenice setá x pšenice špalda','Triticum aestivum L. x Triticum spelta L.','spring_wheat'),
('567','pšenice jednozrnka','Triticum monococcum L.','spring_wheat'),
('576','tykev muškátová','Cucurbita moschata Duchesne','pumpkin_winter_squash'),
('6','ječmen ozimý','Hordeum vulgare L.','barley'),
('64','mezidruhový hybrid','X FESTULOLIUM','ryegrass_hay'),
('65','čirok cukrový','Sorghum saccharatum','sorghum_sweet'),
('7','ječmen jarní','Hordeum vulgare L.','barley'),
('703','Carthamus tinctorius','Carthamus tinctorius','safflower'),
('718','máta dlouholistá','Mentha longifolia','mint'),
('74','oves hřebílkatý','Avena strigosa Schreb.','oats'),
('77','kapusta krmná','Brassica oleracea L. convar.acephala(DC.)','cabbage_crucifer'),
('79','mrkev krmná','Daucus carota L.','carrot'),
('798','podzemnice olejná','Arachis hypogaea L.','peanut'),
('814','paprika čínská','Capsicum chinense','pepper'),
('816','bob zahradní','Vicia faba L.','faba_bean_dry'),
('823','rýže','Oryza sativa L.','rice'),
('83','řepa cukrová','Beta vulgaris L. var.altissima Dőll','sugar_beet'),
('830','ředkev setá bílá','Raphanus sativus var. longipinnatus','radish'),
('84','brambory','Solanum tuberosum L.','potato'),
('85','brokolice','Brassica oleracea L. (skupina Brokolice)','broccoli'),
('87','kedluben','Brassica oleracea L.','cabbage_crucifer'),
('89','celer','Apium graveolens L.','celery'),
('9','oves setý jarní','Avena sativa L.','oats'),
('91','celer listový','APIUM GRAVEOLENS','celery'),
('5','žito ozimé','Secale cereale L.','rye_cereal'),
('561','žito jarní','Secale cereale L.','rye_cereal'),
('8','tritikale ozimé','x Triticosecale Wittm. ex A. Camus','triticale_cereal'),
('447','tritikale jarní','x Triticosecale Wittm. ex A. Camus','triticale_cereal'),
('25','mák setý jarní','Papaver somniferum L.','poppy_seed'),
('452','mák setý ozimý','Papaver somniferum L.','poppy_seed'),
('94','cibule','Allium cepa L.','onion_dry');

DO $$
DECLARE
  c integer;
  missing integer;
BEGIN
  SELECT count(*) INTO c FROM aegris_species_mapping;
  IF c <> 134 THEN
    RAISE EXCEPTION 'Import čekal 134 DIRECT druhů, ale našel %', c;
  END IF;

  SELECT count(*) INTO missing
  FROM aegris_species_mapping m
  LEFT JOIN public.crop_catalog cc
    ON cc.source_system = 'UKZUZ_OOS_CIS01D'
   AND cc.external_code::text = m.external_code
  WHERE cc.id IS NULL;

  IF missing <> 0 THEN
    RAISE EXCEPTION 'V crop_catalog chybí % z 134 očekávaných ÚKZÚZ druhů. Import byl zrušen.', missing;
  END IF;
END $$;

-- Trvalá záloha původního mapování před prvním importem.
CREATE TABLE IF NOT EXISTS public.aegris_crop_catalog_profile_backup_20260905 AS
SELECT
  cc.id AS crop_catalog_id,
  cc.source_system,
  cc.external_code,
  cc.name,
  cc.crop_profile_id AS previous_crop_profile_id,
  now() AS backed_up_at
FROM public.crop_catalog cc
JOIN aegris_species_mapping m
  ON cc.source_system = 'UKZUZ_OOS_CIS01D'
 AND cc.external_code::text = m.external_code;

UPDATE public.crop_catalog cc
SET crop_profile_id = cp.id
FROM aegris_species_mapping m
JOIN aegris_import_profiles p ON p.profile_key = m.profile_key
JOIN public.crop_profiles cp ON cp.name = p.profile_name
WHERE cc.source_system = 'UKZUZ_OOS_CIS01D'
  AND cc.external_code::text = m.external_code;

-- 6) Finální guardrails
DO $$
DECLARE
  mapped integer;
  profiles integer;
BEGIN
  SELECT count(*) INTO profiles
  FROM public.crop_profiles cp
  JOIN aegris_import_profiles p ON p.profile_name = cp.name;

  SELECT count(*) INTO mapped
  FROM public.crop_catalog cc
  JOIN aegris_species_mapping m
    ON cc.source_system = 'UKZUZ_OOS_CIS01D'
   AND cc.external_code::text = m.external_code
  JOIN aegris_import_profiles p ON p.profile_key = m.profile_key
  JOIN public.crop_profiles cp
    ON cp.name = p.profile_name
   AND cc.crop_profile_id = cp.id;

  IF profiles <> 58 THEN
    RAISE EXCEPTION 'Po importu není 58 profilů, ale %', profiles;
  END IF;

  IF mapped <> 134 THEN
    RAISE EXCEPTION 'Po importu není správně namapováno 134 druhů, ale %', mapped;
  END IF;

  RAISE NOTICE 'AEGRIS IMPORT OK: % profilů, % DIRECT druhů namapováno.', profiles, mapped;
END $$;

COMMIT;

-- ============================================================================
-- Ověřovací SELECTY po COMMITu
-- ============================================================================
SELECT count(*) AS aegris_direct_profily
FROM public.crop_profiles
WHERE category = 'AEGRIS DIRECT v2';

SELECT count(*) AS namapovane_ukzuz_direct_druhy
FROM public.crop_catalog cc
JOIN public.crop_profiles cp ON cp.id = cc.crop_profile_id
WHERE cc.source_system = 'UKZUZ_OOS_CIS01D'
  AND cp.category = 'AEGRIS DIRECT v2';

SELECT
  cp.name AS profil,
  cp.min_temperature_c,
  cp.max_temperature_c,
  cp.ph_min,
  cp.ph_max,
  cp.water_need,
  count(cc.id) AS pocet_ukzuz_druhu
FROM public.crop_profiles cp
LEFT JOIN public.crop_catalog cc ON cc.crop_profile_id = cp.id
WHERE cp.category = 'AEGRIS DIRECT v2'
GROUP BY cp.id, cp.name, cp.min_temperature_c, cp.max_temperature_c, cp.ph_min, cp.ph_max, cp.water_need
ORDER BY cp.name;
