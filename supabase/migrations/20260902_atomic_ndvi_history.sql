begin;

create or replace function public.replace_project_ndvi_history(
  p_project_id bigint,
  p_rows jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_row_count integer;
  v_invalid_count integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'replace_project_ndvi_history requires service_role'
      using errcode = '42501';
  end if;

  if p_project_id is null or p_project_id <= 0 then
    raise exception 'p_project_id must be a positive integer'
      using errcode = '22023';
  end if;

  if p_rows is null
     or jsonb_typeof(p_rows) is distinct from 'array' then
    raise exception 'p_rows must be a JSON array'
      using errcode = '22023';
  end if;

  v_row_count := jsonb_array_length(p_rows);

  if v_row_count = 0 then
    raise exception 'p_rows must contain at least one NDVI history row'
      using errcode = '22023';
  end if;

  select count(*)
  into v_invalid_count
  from jsonb_to_recordset(p_rows) as r(
    project_id bigint,
    period_from timestamptz,
    period_to timestamptz,
    ndvi double precision
  )
  where r.project_id is distinct from p_project_id
     or r.period_from is null
     or r.period_to is null
     or r.period_to < r.period_from
     or r.ndvi is null
     or r.ndvi < -1
     or r.ndvi > 1;

  if v_invalid_count > 0 then
    raise exception 'p_rows contains invalid NDVI history data'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(p_project_id);

  delete from public.ndvi_history
  where project_id = p_project_id;

  insert into public.ndvi_history (
    project_id,
    period_from,
    period_to,
    ndvi
  )
  select
    p_project_id,
    r.period_from,
    r.period_to,
    r.ndvi
  from jsonb_to_recordset(p_rows) as r(
    project_id bigint,
    period_from timestamptz,
    period_to timestamptz,
    ndvi double precision
  )
  order by r.period_from, r.period_to;

  get diagnostics v_row_count = row_count;

  if v_row_count <> jsonb_array_length(p_rows) then
    raise exception 'NDVI history row count mismatch after insert'
      using errcode = 'P0001';
  end if;
end;
$function$;

revoke all on function public.replace_project_ndvi_history(bigint, jsonb) from public;
revoke all on function public.replace_project_ndvi_history(bigint, jsonb) from anon;
revoke all on function public.replace_project_ndvi_history(bigint, jsonb) from authenticated;

grant execute on function public.replace_project_ndvi_history(bigint, jsonb)
to service_role;

comment on function public.replace_project_ndvi_history(bigint, jsonb) is
  'Atomically replaces all NDVI history rows for one project. Service-role only.';

commit;
