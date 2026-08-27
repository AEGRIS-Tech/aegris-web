-- AEGRIS: Demo Provisioning Hardening v1
--
-- Goals:
-- 1) Prevent duplicate demo requests for the same normalized e-mail.
-- 2) Add an atomic DB-backed rate limiter for the public /api/demo endpoint.
-- 3) Keep demo rate-limit state inaccessible to anon/authenticated clients.
-- 4) Expose the limiter only to the backend service_role.
--
-- IMPORTANT:
-- Do not run this migration in production until the matching application
-- code has been updated and verified.

begin;

-- =========================================================
-- 1. PRECHECK: normalized demo e-mails must already be unique
-- =========================================================

do $$
begin
  if exists (
    select 1
    from public.demo_requests
    group by lower(btrim(email))
    having count(*) > 1
  ) then
    raise exception
      'Cannot add normalized demo e-mail uniqueness: duplicate demo_requests e-mails exist';
  end if;
end
$$;

-- =========================================================
-- 2. ATOMIC UNIQUENESS FOR NORMALIZED E-MAIL
-- =========================================================
--
-- The API normalizes e-mail with trim + lowercase.
-- This expression index enforces the same rule in PostgreSQL
-- and closes the SELECT -> INSERT race condition.

create unique index if not exists
  demo_requests_email_normalized_uidx
on public.demo_requests (
  lower(btrim(email))
);

-- =========================================================
-- 3. DEMO RATE-LIMIT STORAGE
-- =========================================================
--
-- key_hash contains a server-generated hash of the client identifier.
-- Raw IP addresses do not need to be stored in this table.

create table if not exists public.demo_rate_limits (
  key_hash text primary key,

  window_started_at timestamptz not null,

  request_count integer not null default 0
    check (request_count >= 0),

  updated_at timestamptz not null default now()
);

alter table public.demo_rate_limits
  enable row level security;

-- No anon/authenticated policies are intentionally created.
-- The table is backend-only.

revoke all
on table public.demo_rate_limits
from anon, authenticated;

grant select, insert, update, delete
on table public.demo_rate_limits
to service_role;

-- =========================================================
-- 4. ATOMIC DEMO RATE-LIMIT RPC
-- =========================================================
--
-- Same locking model as AEGRIS analysis rate limiting:
--
-- INSERT ... ON CONFLICT
-- +
-- SELECT ... FOR UPDATE
--
-- Therefore concurrent requests for the same key are serialized.

create or replace function public.consume_demo_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 3600
)
returns table (
  allowed boolean,
  request_count integer,
  retry_after_seconds integer
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();

  v_window_started_at timestamptz;
  v_current_count integer;

  v_elapsed integer;
  v_retry_after integer;

  v_key_hash text := btrim(p_key_hash);
begin
  -- -------------------------------------------------------
  -- Input validation
  -- -------------------------------------------------------

  if v_key_hash is null or v_key_hash = '' then
    raise exception 'p_key_hash must not be empty';
  end if;

  if length(v_key_hash) > 128 then
    raise exception 'p_key_hash is too long';
  end if;

  if p_limit < 1 then
    raise exception 'p_limit must be greater than 0';
  end if;

  if p_window_seconds < 1 then
    raise exception 'p_window_seconds must be greater than 0';
  end if;

  -- -------------------------------------------------------
  -- Ensure the row exists atomically
  -- -------------------------------------------------------

  insert into public.demo_rate_limits (
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    v_key_hash,
    v_now,
    0,
    v_now
  )
  on conflict (key_hash) do nothing;

  -- -------------------------------------------------------
  -- Serialize concurrent requests for this key
  -- -------------------------------------------------------

  select
    drl.window_started_at,
    drl.request_count
  into
    v_window_started_at,
    v_current_count
  from public.demo_rate_limits as drl
  where drl.key_hash = v_key_hash
  for update;

  if not found then
    raise exception
      'Demo rate-limit row could not be initialized';
  end if;

  v_elapsed :=
    floor(
      extract(
        epoch from (
          v_now - v_window_started_at
        )
      )
    )::integer;

  -- -------------------------------------------------------
  -- New rate-limit window
  -- -------------------------------------------------------

  if v_elapsed >= p_window_seconds then
    update public.demo_rate_limits as drl
    set
      window_started_at = v_now,
      request_count = 1,
      updated_at = v_now
    where drl.key_hash = v_key_hash;

    return query
    select
      true,
      1,
      0;

    return;
  end if;

  -- -------------------------------------------------------
  -- Limit already exhausted
  -- -------------------------------------------------------

  if v_current_count >= p_limit then
    v_retry_after :=
      greatest(
        p_window_seconds - v_elapsed,
        1
      );

    update public.demo_rate_limits as drl
    set
      updated_at = v_now
    where drl.key_hash = v_key_hash;

    return query
    select
      false,
      v_current_count,
      v_retry_after;

    return;
  end if;

  -- -------------------------------------------------------
  -- Request allowed
  -- -------------------------------------------------------

  update public.demo_rate_limits as drl
  set
    request_count = drl.request_count + 1,
    updated_at = v_now
  where drl.key_hash = v_key_hash;

  return query
  select
    true,
    v_current_count + 1,
    0;
end;
$$;

-- =========================================================
-- 5. LOCK DOWN THE RPC
-- =========================================================

revoke all
on function public.consume_demo_rate_limit(
  text,
  integer,
  integer
)
from public;

revoke all
on function public.consume_demo_rate_limit(
  text,
  integer,
  integer
)
from anon;

revoke all
on function public.consume_demo_rate_limit(
  text,
  integer,
  integer
)
from authenticated;

grant execute
on function public.consume_demo_rate_limit(
  text,
  integer,
  integer
)
to service_role;

commit;