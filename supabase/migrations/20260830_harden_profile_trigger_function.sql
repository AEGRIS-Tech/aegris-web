begin;

revoke execute
on function public.update_profile_updated_at()
from public, anon, authenticated, service_role;

commit;
