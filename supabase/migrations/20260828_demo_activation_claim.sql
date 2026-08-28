-- AEGRIS: Demo activation atomic claim hardening
--
-- Goals:
-- 1) Prevent concurrent workers from provisioning the same demo request.
-- 2) Introduce an explicit processing state.
-- 3) Allow stale processing claims to be recovered after worker failure.
-- 4) Expose the claim operation only to service_role.

begin;

-- =========================================================
-- 1. PROCESSING STATE
-- =========================================================

alter table public.demo_requests
  add column if not exists processing_started_at timestamptz;

alter table public.demo_requests
  drop constraint if exists demo_requests_status_check;

alter table public.demo_requests
  add constraint demo_requests_status_check
  check (
    status = any (
      array[
        'new'::text,
        'processing'::text,
        'contacted'::text,
        'closed'::text
      ]
    )
  );

-- Keep processing timestamp consistent with request state.
alter table public.demo_requests
  drop constraint if exists demo_requests_processing_state_check;

alter table public.demo_requests
  add constraint demo_requests_processing_state_check
  check (
    (
      status = 'processing'
      and processing_started_at is not null
    )
    or
    (
      status <> 'processing'
      and processing_started_at is null
    )
  );

-- =========================================================
-- 2. CLAIM LOOKUP INDEX
-- =========================================================

create index if not exists demo_requests_activation_claim_idx
on public.demo_requests (
  status,
  processing_started_at,
  created_at
);

-- =========================================================
-- 3. ATOMIC CLAIM RPC
-- =========================================================
--
-- FOR UPDATE SKIP LOCKED guarantees that two concurrent
-- workers cannot claim the same request.
--
-- Stale processing rows may be reclaimed after the configured
-- timeout so a crashed worker does not leave requests stuck
-- forever.

create or replace function public.claim_demo_requests(
  p_batch_size integer default 10,
  p_stale_after_seconds integer default 900
)
returns table (
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
volatile
security definer
set search_path = ''
as $$
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
      dr.approved_at is null
      and (
        (
          dr.status = 'new'
          and dr.user_id is null
        )
        or (
          dr.status = 'processing'
          and dr.processing_started_at
            <= v_now - make_interval(
              secs => p_stale_after_seconds
            )
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
$$;

-- =========================================================
-- 4. RPC ACCESS
-- =========================================================

revoke all
on function public.claim_demo_requests(
  integer,
  integer
)
from public;

revoke all
on function public.claim_demo_requests(
  integer,
  integer
)
from anon;

revoke all
on function public.claim_demo_requests(
  integer,
  integer
)
from authenticated;

grant execute
on function public.claim_demo_requests(
  integer,
  integer
)
to service_role;

commit;

