-- AEGRIS DIRECT v2 rollback – vrací pouze teplotu/pH na stav před prvním DIRECT v2 importem.
BEGIN;

UPDATE public.crop_profiles cp
SET
  min_temperature_c = b.previous_min_temperature_c,
  max_temperature_c = b.previous_max_temperature_c,
  ph_min = b.previous_ph_min,
  ph_max = b.previous_ph_max
FROM public.aegris_direct_v2_env_backup_20260905 b
WHERE cp.id = b.crop_profile_id;

UPDATE public.aegris_agronomic_profile_provenance_v1 p
SET
  ecocrop_url = b.previous_ecocrop_url,
  environmental_status = b.previous_environmental_status
FROM public.aegris_direct_v2_env_backup_20260905 b
WHERE p.profile_key = b.profile_key;

COMMIT;
