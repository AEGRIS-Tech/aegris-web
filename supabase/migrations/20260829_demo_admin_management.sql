begin;

alter table public.demo_requests
  add column if not exists decided_by uuid,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists demo_duration_days integer;

alter table public.demo_requests
  drop constraint if exists demo_requests_demo_duration_days_check;

alter table public.demo_requests
  add constraint demo_requests_demo_duration_days_check
  check (
    demo_duration_days is null
    or demo_duration_days between 1 and 365
  );

alter table public.demo_requests
  drop constraint if exists demo_requests_rejection_reason_check;

alter table public.demo_requests
  add constraint demo_requests_rejection_reason_check
  check (
    rejection_reason is null
    or char_length(rejection_reason) <= 2000
  );

create or replace function public.claim_demo_requests(
  p_batch_size integer default 10,
  p_stale_after_seconds integer default 900
)
returns table(
  id bigint,
  full_name text,
  company text,
  email text,
  phone text,
  message text,
  status text,
  user_id uuid,
  approved_at timestamptz,
  created_at timestamptz,
  processing_started_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := now();
begin
  if p_batch_size < 1 or p_batch_size > 100 then
    raise exception
      'p_batch_size must be between 1 and 100';
  end if;

  if p_stale_after_seconds < 1 then
    raise exception
      'p_stale_after_seconds must be greater than 0';
  end if;

  return query
  with candidates as (
    select dr.id
    from public.demo_requests as dr
    where
      (
        dr.status = 'approved'
        and dr.user_id is null
      )
      or (
        dr.status = 'processing'
        and dr.processing_started_at
          <= v_now - make_interval(
            secs => p_stale_after_seconds
          )
      )
    order by dr.created_at asc
    for update skip locked
    limit p_batch_size
  )
  update public.demo_requests as dr
  set
    status = 'processing',
    processing_started_at = v_now
  from candidates
  where dr.id = candidates.id
  returning
    dr.id,
    dr.full_name,
    dr.company,
    dr.email,
    dr.phone,
    dr.message,
    dr.status,
    dr.user_id,
    dr.approved_at,
    dr.created_at,
    dr.processing_started_at;
end;
$function$;


alter table public.demo_requests
  drop constraint if exists demo_requests_status_check;

alter table public.demo_requests
  add constraint demo_requests_status_check
  check (
    status in (
      'new',
      'approved',
      'processing',
      'contacted',
      'rejected',
      'closed'
    )
  );
commit;
