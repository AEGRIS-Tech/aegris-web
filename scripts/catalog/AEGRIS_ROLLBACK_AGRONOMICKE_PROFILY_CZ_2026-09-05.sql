-- AEGRIS rollback mapování DIRECT profilů v1
-- Vrátí pouze crop_catalog.crop_profile_id na hodnotu uloženou před prvním importem.
BEGIN;

UPDATE public.crop_catalog cc
SET crop_profile_id = b.previous_crop_profile_id
FROM public.aegris_crop_catalog_profile_backup_20260905 b
WHERE cc.id = b.crop_catalog_id;

COMMIT;

SELECT count(*) AS obnovene_vazby
FROM public.aegris_crop_catalog_profile_backup_20260905;
