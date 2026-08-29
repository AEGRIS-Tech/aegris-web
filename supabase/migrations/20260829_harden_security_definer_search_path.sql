begin;

alter function public.consume_demo_rate_limit(
  text,
  integer,
  integer
)
set search_path = '';

alter function public.mark_aegris_alert_read(
  bigint
)
set search_path = '';

commit;
