begin;

revoke all privileges
on sequence public.analysis_id_seq
from anon, authenticated;

commit;
