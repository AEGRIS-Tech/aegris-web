-- AEGRIS GROUP v1 rollback
-- Vrací pouze 18 crop_catalog vazeb na stav před prvním GROUP v1 importem.
BEGIN;

UPDATE public.crop_catalog cc
SET crop_profile_id = b.previous_crop_profile_id
FROM public.aegris_crop_catalog_group_v1_backup_20260905 b
WHERE cc.id = b.crop_catalog_id;

COMMIT;

SELECT count(*) AS obnovene_vazby
FROM public.aegris_crop_catalog_group_v1_backup_20260905;
