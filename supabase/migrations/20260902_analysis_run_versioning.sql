begin;

-- ============================================================
-- AEGRIS P1
-- Analysis run versioning, reproducibility and atomic core write
-- 2026-09-02
--
-- Cíl:
-- 1. každá nová analýza zná verzi Decision Enginu / rulesetu
-- 2. ukládá reprodukovatelný input/output evidence snapshot
-- 3. NDVI history + analysis + recommendation se uloží atomicky
-- 4. alert lifecycle zůstává mimo core transaction a je nonfatal
-- ============================================================


-- ------------------------------------------------------------
-- 1. VERSIONING + REPRODUCIBILITY COLUMNS
-- ------------------------------------------------------------

alter table public.analysis
  add column if not exists engine_version text,
  add column if not exists ruleset_version text,
  add column if not exists input_snapshot jsonb,
  add column if not exists decision_snapshot jsonb,
  add column if not exists data_completeness_pct numeric;


comment on column public.analysis.engine_version is
  'Version of AEGRIS Decision Engine implementation used for this analysis.';

comment on column public.analysis.ruleset_version is
  'Version of agronomic/ruleset configuration used for this analysis.';

comment on column public.analysis.input_snapshot is
  'Server-authoritative input evidence snapshot used by the Decision Engine.';

comment on column public.analysis.decision_snapshot is
  'Full Decision Engine output snapshot for reproducibility and audit.';

comment on column public.analysis.data_completeness_pct is
  'Canonical Decision Engine data completeness percentage at analysis time.';


-- Staré záznamy mohou mít NULL.
-- Nové zápisy přes RPC budou validovány uvnitř funkce.

alter table public.analysis
  drop constraint if exists analysis_data_completeness_pct_check;

alter table public.analysis
  add constraint analysis_data_completeness_pct_check
  check (
    data_completeness_pct is null
    or (
      data_completeness_pct >= 0
      and data_completeness_pct <= 100
    )
  );


-- ------------------------------------------------------------
-- 2. ATOMIC CORE ANALYSIS PERSISTENCE
-- ------------------------------------------------------------
--
-- Jedna PostgreSQL transakční jednotka:
--
--   NDVI history replacement
--        +
--   analysis INSERT
--        +
--   aegris_recommendations INSERT
--
-- Pokud jakákoli část selže, rollbackne se celý RPC statement.
--
-- Alerty zůstávají záměrně mimo tuto funkci.
-- Jejich selhání nesmí zneplatnit již vytvořenou analýzu.
-- ------------------------------------------------------------

create or replace function public.persist_aegris_analysis_run(
  p_project_id bigint,
  p_history_rows jsonb,
  p_analysis jsonb,
  p_recommendation jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_analysis public.analysis%rowtype;
  v_recommendation public.aegris_recommendations%rowtype;
  v_expected_history_count integer;
  v_inserted_history_count integer;
  v_engine_version text;
  v_ruleset_version text;
  v_data_completeness numeric;
begin
  -- ----------------------------------------------------------
  -- SECURITY
  -- ----------------------------------------------------------

  if auth.role() is distinct from 'service_role' then
    raise exception 'persist_aegris_analysis_run is restricted to service_role';
  end if;


  -- ----------------------------------------------------------
  -- BASIC INPUT VALIDATION
  -- ----------------------------------------------------------

  if p_project_id is null or p_project_id <= 0 then
    raise exception 'Invalid project_id';
  end if;

  if p_history_rows is null
     or jsonb_typeof(p_history_rows) <> 'array'
     or jsonb_array_length(p_history_rows) = 0 then
    raise exception 'p_history_rows must be a non-empty JSON array';
  end if;

  if p_analysis is null
     or jsonb_typeof(p_analysis) <> 'object' then
    raise exception 'p_analysis must be a JSON object';
  end if;

  if p_recommendation is null
     or jsonb_typeof(p_recommendation) <> 'object' then
    raise exception 'p_recommendation must be a JSON object';
  end if;


  -- ----------------------------------------------------------
  -- PROJECT VALIDATION
  -- ----------------------------------------------------------

  if not exists (
    select 1
    from public.projects
    where id = p_project_id
  ) then
    raise exception 'Project % does not exist', p_project_id;
  end if;


  -- ----------------------------------------------------------
  -- ENGINE / RULESET VERSION VALIDATION
  -- ----------------------------------------------------------

  v_engine_version :=
    nullif(btrim(p_analysis ->> 'engine_version'), '');

  v_ruleset_version :=
    nullif(btrim(p_analysis ->> 'ruleset_version'), '');

  if v_engine_version is null then
    raise exception 'engine_version is required';
  end if;

  if v_ruleset_version is null then
    raise exception 'ruleset_version is required';
  end if;


  -- ----------------------------------------------------------
  -- SNAPSHOT VALIDATION
  -- ----------------------------------------------------------

  if p_analysis -> 'input_snapshot' is null
     or jsonb_typeof(p_analysis -> 'input_snapshot') <> 'object' then
    raise exception 'input_snapshot must be a JSON object';
  end if;

  if p_analysis -> 'decision_snapshot' is null
     or jsonb_typeof(p_analysis -> 'decision_snapshot') <> 'object' then
    raise exception 'decision_snapshot must be a JSON object';
  end if;


  -- ----------------------------------------------------------
  -- DATA COMPLETENESS VALIDATION
  -- ----------------------------------------------------------

  begin
    v_data_completeness :=
      nullif(p_analysis ->> 'data_completeness_pct', '')::numeric;
  exception
    when invalid_text_representation then
      raise exception 'Invalid data_completeness_pct';
  end;

  if v_data_completeness is null
     or v_data_completeness < 0
     or v_data_completeness > 100 then
    raise exception 'data_completeness_pct must be between 0 and 100';
  end if;


  -- ----------------------------------------------------------
  -- SERIALIZE ANALYSIS WRITES PER PROJECT
  -- ----------------------------------------------------------

  perform pg_advisory_xact_lock(p_project_id);


  -- ----------------------------------------------------------
  -- VALIDATE NDVI HISTORY BEFORE DELETE
  -- ----------------------------------------------------------

  if exists (
    select 1
    from jsonb_array_elements(p_history_rows) as item
    where
      nullif(item ->> 'project_id', '') is null
      or (item ->> 'project_id')::bigint <> p_project_id

      or nullif(item ->> 'period_from', '') is null
      or nullif(item ->> 'period_to', '') is null

      or (item ->> 'period_to')::timestamptz
         < (item ->> 'period_from')::timestamptz

      or nullif(item ->> 'ndvi', '') is null
      or (item ->> 'ndvi')::double precision < -1
      or (item ->> 'ndvi')::double precision > 1
  ) then
    raise exception 'Invalid NDVI history payload';
  end if;


  -- ----------------------------------------------------------
  -- ATOMIC NDVI HISTORY REPLACEMENT
  -- ----------------------------------------------------------

  v_expected_history_count := jsonb_array_length(p_history_rows);

  delete from public.ndvi_history
  where project_id = p_project_id;

  insert into public.ndvi_history (
    project_id,
    period_from,
    period_to,
    ndvi
  )
  select
    (item ->> 'project_id')::bigint,
    (item ->> 'period_from')::timestamptz,
    (item ->> 'period_to')::timestamptz,
    (item ->> 'ndvi')::double precision
  from jsonb_array_elements(p_history_rows) as item;

  get diagnostics v_inserted_history_count = row_count;

  if v_inserted_history_count <> v_expected_history_count then
    raise exception
      'NDVI history insert count mismatch. Expected %, inserted %',
      v_expected_history_count,
      v_inserted_history_count;
  end if;


  -- ----------------------------------------------------------
  -- ANALYSIS INSERT
  -- ----------------------------------------------------------

  insert into public.analysis (
    project_id,
    ndvi,
    vegetation,
    risk,
    created_at,
    period_from,
    period_to,
    source_provider,
    satellite,
    satellite_product,
    spatial_resolution_m,
    analysis_crs,
    analysis_utm_zone,
    geometry_pixel_count,
    valid_pixel_count,
    valid_geometry_pct,
    accepted_intervals,
    rejected_intervals,
    quality_gate_pct,
    median_ndvi,
    p05_ndvi,
    p95_ndvi,
    engine_version,
    ruleset_version,
    input_snapshot,
    decision_snapshot,
    data_completeness_pct
  )
  values (
    p_project_id,

    nullif(p_analysis ->> 'ndvi', '')::numeric,

    nullif(p_analysis ->> 'vegetation', '')::integer,

    nullif(p_analysis ->> 'risk', ''),

    coalesce(
      nullif(p_analysis ->> 'created_at', '')::timestamptz,
      now()
    ),

    nullif(p_analysis ->> 'period_from', '')::timestamptz,

    nullif(p_analysis ->> 'period_to', '')::timestamptz,

    nullif(p_analysis ->> 'source_provider', ''),

    nullif(p_analysis ->> 'satellite', ''),

    nullif(p_analysis ->> 'satellite_product', ''),

    nullif(p_analysis ->> 'spatial_resolution_m', '')::integer,

    nullif(p_analysis ->> 'analysis_crs', ''),

    nullif(p_analysis ->> 'analysis_utm_zone', '')::integer,

    nullif(p_analysis ->> 'geometry_pixel_count', '')::integer,

    nullif(p_analysis ->> 'valid_pixel_count', '')::integer,

    nullif(p_analysis ->> 'valid_geometry_pct', '')::numeric,

    nullif(p_analysis ->> 'accepted_intervals', '')::integer,

    nullif(p_analysis ->> 'rejected_intervals', '')::integer,

    nullif(p_analysis ->> 'quality_gate_pct', '')::numeric,

    nullif(p_analysis ->> 'median_ndvi', '')::numeric,

    nullif(p_analysis ->> 'p05_ndvi', '')::numeric,

    nullif(p_analysis ->> 'p95_ndvi', '')::numeric,

    v_engine_version,

    v_ruleset_version,

    p_analysis -> 'input_snapshot',

    p_analysis -> 'decision_snapshot',

    v_data_completeness
  )
  returning *
  into v_analysis;


  -- ----------------------------------------------------------
  -- RECOMMENDATION VALIDATION
  -- ----------------------------------------------------------

  if nullif(btrim(p_recommendation ->> 'level'), '') is null then
    raise exception 'recommendation.level is required';
  end if;

  if nullif(btrim(p_recommendation ->> 'priority'), '') is null then
    raise exception 'recommendation.priority is required';
  end if;

  if nullif(btrim(p_recommendation ->> 'summary'), '') is null then
    raise exception 'recommendation.summary is required';
  end if;

  if nullif(btrim(p_recommendation ->> 'recommendation'), '') is null then
    raise exception 'recommendation.recommendation is required';
  end if;

  if p_recommendation -> 'actions' is not null
     and jsonb_typeof(p_recommendation -> 'actions') <> 'array' then
    raise exception 'recommendation.actions must be a JSON array';
  end if;


  -- ----------------------------------------------------------
  -- RECOMMENDATION INSERT
  -- ----------------------------------------------------------

  insert into public.aegris_recommendations (
    project_id,
    analysis_id,
    crop_name,
    growth_stage,
    ndvi,
    level,
    priority,
    score,
    summary,
    recommendation,
    actions,
    weather_snapshot
  )
  values (
    p_project_id,

    v_analysis.id,

    nullif(p_recommendation ->> 'crop_name', ''),

    nullif(p_recommendation ->> 'growth_stage', ''),

    nullif(p_recommendation ->> 'ndvi', '')::double precision,

    p_recommendation ->> 'level',

    p_recommendation ->> 'priority',

    nullif(p_recommendation ->> 'score', '')::integer,

    p_recommendation ->> 'summary',

    p_recommendation ->> 'recommendation',

    coalesce(
      p_recommendation -> 'actions',
      '[]'::jsonb
    ),

    p_recommendation -> 'weather_snapshot'
  )
  returning *
  into v_recommendation;


  -- ----------------------------------------------------------
  -- RETURN ATOMIC RESULT
  -- ----------------------------------------------------------

  return jsonb_build_object(
    'analysis',
    to_jsonb(v_analysis),
    'recommendation',
    to_jsonb(v_recommendation)
  );
end;
$function$;


-- ------------------------------------------------------------
-- 3. PRIVILEGES
-- ------------------------------------------------------------

revoke all
on function public.persist_aegris_analysis_run(
  bigint,
  jsonb,
  jsonb,
  jsonb
)
from public;

revoke all
on function public.persist_aegris_analysis_run(
  bigint,
  jsonb,
  jsonb,
  jsonb
)
from anon;

revoke all
on function public.persist_aegris_analysis_run(
  bigint,
  jsonb,
  jsonb,
  jsonb
)
from authenticated;

grant execute
on function public.persist_aegris_analysis_run(
  bigint,
  jsonb,
  jsonb,
  jsonb
)
to service_role;


comment on function public.persist_aegris_analysis_run(
  bigint,
  jsonb,
  jsonb,
  jsonb
) is
  'Atomically replaces project NDVI history and persists one versioned AEGRIS analysis plus its recommendation. Restricted to service_role.';


commit;