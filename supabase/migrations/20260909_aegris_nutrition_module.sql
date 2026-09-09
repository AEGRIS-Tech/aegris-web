-- AEGRIS crop nutrition foundation
-- Reproduces the nutrition/fertilization database layer that was initially
-- created directly in Supabase during pilot development.
-- Generated from the verified production schema/constraints/RLS/seed snapshot
-- on 2026-09-09.
--
-- IMPORTANT:
-- - Project/user fertilization values are NOT seeded.
-- - Reference seed rows currently target crop_profiles.id = 75 (rye / žito),
--   matching the current AEGRIS production data model.
-- - Safe for the current production DB: CREATE TABLE IF NOT EXISTS, guarded
--   constraints, idempotent policies, and ON CONFLICT DO NOTHING seeds.

begin;

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.agronomic_sources (
  id bigint primary key,
  authority text not null,
  title text not null,
  edition text,
  publication_year integer,
  isbn text,
  source_url text,
  source_type text not null default 'methodology',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.crop_fertilization_adjustments (
  id bigint primary key,
  crop_profile_id bigint,
  nutrient text not null,
  adjustment_type text not null,
  condition_key text,
  condition_value text,
  adjustment_value numeric,
  adjustment_unit text,
  description text not null,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.crop_nitrogen_splits (
  id bigint primary key,
  crop_profile_id bigint not null,
  application_stage text not null,
  application_order integer not null default 1,
  share_percent numeric not null,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.crop_nutrient_requirements (
  id bigint primary key,
  crop_profile_id bigint not null,
  nutrient text not null,
  nutrient_form text not null,
  yield_level text,
  soil_supply_class text,
  dose_kg_ha numeric,
  min_dose_kg_ha numeric,
  max_dose_kg_ha numeric,
  recommendation_type text not null default 'methodology',
  source_id bigint not null,
  source_table text,
  source_note text,
  created_at timestamptz not null default now(),
  demand_group smallint
);

create table if not exists public.crop_organic_fertilization (
  id bigint primary key,
  crop_profile_id bigint not null,
  fertilizer_type text not null,
  livestock_type text,
  min_rate_t_ha numeric,
  max_rate_t_ha numeric,
  application_window text,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.crop_yield_levels (
  id bigint primary key,
  crop_profile_id bigint not null,
  yield_level text not null,
  min_yield_t_ha numeric,
  max_yield_t_ha numeric,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.nitrogen_predecessor_adjustments (
  id bigint primary key,
  predecessor_group text not null,
  yield_level text not null,
  adjustment_kg_n_ha numeric not null,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.organic_fertilizer_n_credits (
  id bigint primary key,
  fertilizer_type text not null,
  livestock_type text,
  application_window text not null,
  year_after_application smallint not null,
  effective_n_kg_per_t numeric not null,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.potassium_magnesium_corrections (
  id bigint primary key,
  ratio_min numeric,
  ratio_max numeric,
  correction_factor numeric not null,
  description text not null,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_fertilization_inputs (
  project_id bigint primary key,
  planned_yield_t_ha numeric,
  soil_p_mg_kg numeric,
  soil_k_mg_kg numeric,
  soil_mg_mg_kg numeric,
  soil_ph numeric,
  soil_texture_class text,
  phosphorus_method text,
  predecessor_crop_name text,
  predecessor_group text,
  organic_fertilizer_type text,
  organic_livestock_type text,
  organic_rate_t_ha numeric,
  organic_application_window text,
  organic_year_after_application smallint,
  nmin_kg_ha numeric,
  data_source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soil_nutrient_classification_rules (
  id bigint primary key,
  land_use text not null,
  nutrient text not null,
  analytical_method text,
  soil_texture_class text,
  supply_class text not null,
  min_mg_kg numeric,
  max_mg_kg numeric,
  source_id bigint not null,
  source_table text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. CONSTRAINTS
-- Guarded so this migration can be applied to the existing production DB.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'crop_fertilization_adjustments_crop_profile_id_fkey') then
    alter table public.crop_fertilization_adjustments
      add constraint crop_fertilization_adjustments_crop_profile_id_fkey
      foreign key (crop_profile_id) references public.crop_profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_fertilization_adjustments_source_id_fkey') then
    alter table public.crop_fertilization_adjustments
      add constraint crop_fertilization_adjustments_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'crop_nitrogen_splits_share_check') then
    alter table public.crop_nitrogen_splits
      add constraint crop_nitrogen_splits_share_check
      check (share_percent >= 0 and share_percent <= 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nitrogen_splits_crop_profile_id_fkey') then
    alter table public.crop_nitrogen_splits
      add constraint crop_nitrogen_splits_crop_profile_id_fkey
      foreign key (crop_profile_id) references public.crop_profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nitrogen_splits_source_id_fkey') then
    alter table public.crop_nitrogen_splits
      add constraint crop_nitrogen_splits_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_demand_group_check') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_demand_group_check
      check (demand_group is null or demand_group between 1 and 4);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_nonnegative_check') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_nonnegative_check
      check (coalesce(dose_kg_ha,0) >= 0 and coalesce(min_dose_kg_ha,0) >= 0 and coalesce(max_dose_kg_ha,0) >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_soil_supply_check') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_soil_supply_check
      check (soil_supply_class is null or soil_supply_class in ('low','satisfactory','good','high','very_high'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_yield_level_check') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_yield_level_check
      check (yield_level is null or yield_level in ('low','medium','high'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_crop_profile_id_fkey') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_crop_profile_id_fkey
      foreign key (crop_profile_id) references public.crop_profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_nutrient_requirements_source_id_fkey') then
    alter table public.crop_nutrient_requirements
      add constraint crop_nutrient_requirements_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'crop_organic_fertilization_rate_check') then
    alter table public.crop_organic_fertilization
      add constraint crop_organic_fertilization_rate_check
      check (coalesce(min_rate_t_ha,0) >= 0 and coalesce(max_rate_t_ha,0) >= 0
             and (min_rate_t_ha is null or max_rate_t_ha is null or min_rate_t_ha <= max_rate_t_ha));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_organic_fertilization_crop_profile_id_fkey') then
    alter table public.crop_organic_fertilization
      add constraint crop_organic_fertilization_crop_profile_id_fkey
      foreign key (crop_profile_id) references public.crop_profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_organic_fertilization_source_id_fkey') then
    alter table public.crop_organic_fertilization
      add constraint crop_organic_fertilization_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'crop_yield_levels_level_check') then
    alter table public.crop_yield_levels
      add constraint crop_yield_levels_level_check check (yield_level in ('low','medium','high'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_yield_levels_range_check') then
    alter table public.crop_yield_levels
      add constraint crop_yield_levels_range_check
      check (min_yield_t_ha is null or max_yield_t_ha is null or min_yield_t_ha <= max_yield_t_ha);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_yield_levels_crop_profile_id_fkey') then
    alter table public.crop_yield_levels
      add constraint crop_yield_levels_crop_profile_id_fkey
      foreign key (crop_profile_id) references public.crop_profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'crop_yield_levels_source_id_fkey') then
    alter table public.crop_yield_levels
      add constraint crop_yield_levels_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nitrogen_predecessor_yield_level_check') then
    alter table public.nitrogen_predecessor_adjustments
      add constraint nitrogen_predecessor_yield_level_check check (yield_level in ('low','medium','high'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nitrogen_predecessor_adjustments_source_id_fkey') then
    alter table public.nitrogen_predecessor_adjustments
      add constraint nitrogen_predecessor_adjustments_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'organic_fertilizer_n_value_check') then
    alter table public.organic_fertilizer_n_credits
      add constraint organic_fertilizer_n_value_check check (effective_n_kg_per_t >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'organic_fertilizer_n_year_check') then
    alter table public.organic_fertilizer_n_credits
      add constraint organic_fertilizer_n_year_check check (year_after_application in (1,2));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'organic_fertilizer_n_credits_source_id_fkey') then
    alter table public.organic_fertilizer_n_credits
      add constraint organic_fertilizer_n_credits_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'potassium_magnesium_factor_check') then
    alter table public.potassium_magnesium_corrections
      add constraint potassium_magnesium_factor_check check (correction_factor >= 0 and correction_factor <= 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'potassium_magnesium_corrections_source_id_fkey') then
    alter table public.potassium_magnesium_corrections
      add constraint potassium_magnesium_corrections_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_nmin_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_nmin_check check (nmin_kg_ha is null or nmin_kg_ha >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_organic_rate_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_organic_rate_check check (organic_rate_t_ha is null or organic_rate_t_ha >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_organic_year_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_organic_year_check
      check (organic_year_after_application is null or organic_year_after_application in (1,2));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_ph_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_ph_check check (soil_ph is null or soil_ph between 0 and 14);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_phosphorus_method_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_phosphorus_method_check
      check (phosphorus_method is null or phosphorus_method in ('SP','ICP-OES'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_soil_texture_class_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_soil_texture_class_check
      check (soil_texture_class is null or soil_texture_class in ('light','medium','heavy'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_soil_values_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_soil_values_check
      check (coalesce(soil_p_mg_kg,0) >= 0 and coalesce(soil_k_mg_kg,0) >= 0 and coalesce(soil_mg_mg_kg,0) >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_yield_check') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_yield_check check (planned_yield_t_ha is null or planned_yield_t_ha >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_fertilization_inputs_project_id_fkey') then
    alter table public.project_fertilization_inputs
      add constraint project_fertilization_inputs_project_id_fkey
      foreign key (project_id) references public.projects(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'soil_nutrient_range_check') then
    alter table public.soil_nutrient_classification_rules
      add constraint soil_nutrient_range_check
      check (min_mg_kg is null or max_mg_kg is null or min_mg_kg <= max_mg_kg);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'soil_nutrient_supply_class_check') then
    alter table public.soil_nutrient_classification_rules
      add constraint soil_nutrient_supply_class_check
      check (supply_class in ('low','satisfactory','good','high','very_high'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'soil_nutrient_classification_rules_source_id_fkey') then
    alter table public.soil_nutrient_classification_rules
      add constraint soil_nutrient_classification_rules_source_id_fkey
      foreign key (source_id) references public.agronomic_sources(id) on delete restrict;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. RLS + POLICIES
-- ---------------------------------------------------------------------------

alter table public.agronomic_sources enable row level security;
alter table public.crop_fertilization_adjustments enable row level security;
alter table public.crop_nitrogen_splits enable row level security;
alter table public.crop_nutrient_requirements enable row level security;
alter table public.crop_organic_fertilization enable row level security;
alter table public.crop_yield_levels enable row level security;
alter table public.nitrogen_predecessor_adjustments enable row level security;
alter table public.organic_fertilizer_n_credits enable row level security;
alter table public.potassium_magnesium_corrections enable row level security;
alter table public.project_fertilization_inputs enable row level security;
alter table public.soil_nutrient_classification_rules enable row level security;

drop policy if exists agronomic_sources_authenticated_read on public.agronomic_sources;
create policy agronomic_sources_authenticated_read
  on public.agronomic_sources for select to authenticated using (true);

drop policy if exists crop_fertilization_adjustments_authenticated_read on public.crop_fertilization_adjustments;
create policy crop_fertilization_adjustments_authenticated_read
  on public.crop_fertilization_adjustments for select to authenticated using (true);

drop policy if exists crop_nitrogen_splits_authenticated_read on public.crop_nitrogen_splits;
create policy crop_nitrogen_splits_authenticated_read
  on public.crop_nitrogen_splits for select to authenticated using (true);

drop policy if exists crop_nutrient_requirements_authenticated_read on public.crop_nutrient_requirements;
create policy crop_nutrient_requirements_authenticated_read
  on public.crop_nutrient_requirements for select to authenticated using (true);

drop policy if exists crop_organic_fertilization_authenticated_read on public.crop_organic_fertilization;
create policy crop_organic_fertilization_authenticated_read
  on public.crop_organic_fertilization for select to authenticated using (true);

drop policy if exists crop_yield_levels_authenticated_read on public.crop_yield_levels;
create policy crop_yield_levels_authenticated_read
  on public.crop_yield_levels for select to authenticated using (true);

drop policy if exists nitrogen_predecessor_authenticated_read on public.nitrogen_predecessor_adjustments;
create policy nitrogen_predecessor_authenticated_read
  on public.nitrogen_predecessor_adjustments for select to authenticated using (true);

drop policy if exists organic_fertilizer_n_authenticated_read on public.organic_fertilizer_n_credits;
create policy organic_fertilizer_n_authenticated_read
  on public.organic_fertilizer_n_credits for select to authenticated using (true);

drop policy if exists potassium_magnesium_authenticated_read on public.potassium_magnesium_corrections;
create policy potassium_magnesium_authenticated_read
  on public.potassium_magnesium_corrections for select to authenticated using (true);

drop policy if exists soil_nutrient_classification_authenticated_read on public.soil_nutrient_classification_rules;
create policy soil_nutrient_classification_authenticated_read
  on public.soil_nutrient_classification_rules for select to authenticated using (true);

drop policy if exists fertilization_inputs_select_org_member on public.project_fertilization_inputs;
create policy fertilization_inputs_select_org_member
  on public.project_fertilization_inputs
  for select to authenticated
  using (
    exists (
      select 1
      from public.projects p
      join public.organization_members om
        on om.organization_id = p.organization_id
      where p.id = project_fertilization_inputs.project_id
        and om.user_id = auth.uid()
    )
  );

drop policy if exists fertilization_inputs_insert_org_editor on public.project_fertilization_inputs;
create policy fertilization_inputs_insert_org_editor
  on public.project_fertilization_inputs
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      join public.organization_members om
        on om.organization_id = p.organization_id
      where p.id = project_fertilization_inputs.project_id
        and om.user_id = auth.uid()
        and om.role <> 'viewer'
    )
  );

drop policy if exists fertilization_inputs_update_org_editor on public.project_fertilization_inputs;
create policy fertilization_inputs_update_org_editor
  on public.project_fertilization_inputs
  for update to authenticated
  using (
    exists (
      select 1
      from public.projects p
      join public.organization_members om
        on om.organization_id = p.organization_id
      where p.id = project_fertilization_inputs.project_id
        and om.user_id = auth.uid()
        and om.role <> 'viewer'
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      join public.organization_members om
        on om.organization_id = p.organization_id
      where p.id = project_fertilization_inputs.project_id
        and om.user_id = auth.uid()
        and om.role <> 'viewer'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. GRANTS
-- ---------------------------------------------------------------------------

revoke all on table public.agronomic_sources from anon;
revoke all on table public.crop_fertilization_adjustments from anon;
revoke all on table public.crop_nitrogen_splits from anon;
revoke all on table public.crop_nutrient_requirements from anon;
revoke all on table public.crop_organic_fertilization from anon;
revoke all on table public.crop_yield_levels from anon;
revoke all on table public.nitrogen_predecessor_adjustments from anon;
revoke all on table public.organic_fertilizer_n_credits from anon;
revoke all on table public.potassium_magnesium_corrections from anon;
revoke all on table public.project_fertilization_inputs from anon;
revoke all on table public.soil_nutrient_classification_rules from anon;

grant select on table public.agronomic_sources to authenticated;
grant select on table public.crop_fertilization_adjustments to authenticated;
grant select on table public.crop_nitrogen_splits to authenticated;
grant select on table public.crop_nutrient_requirements to authenticated;
grant select on table public.crop_organic_fertilization to authenticated;
grant select on table public.crop_yield_levels to authenticated;
grant select on table public.nitrogen_predecessor_adjustments to authenticated;
grant select on table public.organic_fertilizer_n_credits to authenticated;
grant select on table public.potassium_magnesium_corrections to authenticated;
grant select on table public.soil_nutrient_classification_rules to authenticated;
grant select, insert, update on table public.project_fertilization_inputs to authenticated;

grant all on table public.agronomic_sources to service_role;
grant all on table public.crop_fertilization_adjustments to service_role;
grant all on table public.crop_nitrogen_splits to service_role;
grant all on table public.crop_nutrient_requirements to service_role;
grant all on table public.crop_organic_fertilization to service_role;
grant all on table public.crop_yield_levels to service_role;
grant all on table public.nitrogen_predecessor_adjustments to service_role;
grant all on table public.organic_fertilizer_n_credits to service_role;
grant all on table public.potassium_magnesium_corrections to service_role;
grant all on table public.project_fertilization_inputs to service_role;
grant all on table public.soil_nutrient_classification_rules to service_role;

-- ---------------------------------------------------------------------------
-- 5. REFERENCE SEED DATA
-- ---------------------------------------------------------------------------

-- Fail clearly on a fresh database if the expected rye crop profile is absent.
do $$
begin
  if not exists (select 1 from public.crop_profiles where id = 75) then
    raise exception 'AEGRIS nutrition seed expects crop_profiles.id = 75 (rye profile) to exist before this migration';
  end if;
end $$;


-- agronomic_sources: 1 rows
insert into public.agronomic_sources (id, isbn, notes, title, edition, authority, created_at, source_url, source_type, publication_year) values
  (1, '978-80-7401-024-8', 'Sekce zemědělských vstupů, Ústřední kontrolní a zkušební ústav zemědělský', 'Metodický návod pro hnojení plodin', '6. vydání', 'ÚKZÚZ', '2026-09-09T05:41:29.065506+00:00', null, 'official_methodology', 2020)
on conflict (id) do nothing;


-- crop_yield_levels: 3 rows
insert into public.crop_yield_levels (id, notes, source_id, created_at, yield_level, source_table, max_yield_t_ha, min_yield_t_ha, crop_profile_id) values
  (1, 'Obilniny – nízká výnosová úroveň do 3,5 t/ha.', 1, '2026-09-09T05:48:09.41806+00:00', 'low', 'Tabulka 14', 3.5, null, 75),
  (2, 'Obilniny – střední výnosová úroveň 3,6–5,0 t/ha.', 1, '2026-09-09T05:48:09.41806+00:00', 'medium', 'Tabulka 14', 5.0, 3.6, 75),
  (3, 'Obilniny – vysoká výnosová úroveň nad 5,0 t/ha.', 1, '2026-09-09T05:48:09.41806+00:00', 'high', 'Tabulka 14', null, 5.01, 75)
on conflict (id) do nothing;


-- crop_nitrogen_splits: 2 rows
insert into public.crop_nitrogen_splits (id, notes, source_id, created_at, source_table, share_percent, crop_profile_id, application_order, application_stage) values
  (1, 'Rámcové dělení celkové dávky N pro žito ozimé.', 1, '2026-09-09T05:48:09.41806+00:00', 'Tabulka 21', 30.0, 75, 1, 'regenerační'),
  (2, 'Rámcové dělení celkové dávky N pro žito ozimé.', 1, '2026-09-09T05:48:09.41806+00:00', 'Tabulka 21', 70.0, 75, 2, 'produkční')
on conflict (id) do nothing;


-- crop_nutrient_requirements: 48 rows
insert into public.crop_nutrient_requirements (id, nutrient, source_id, created_at, dose_kg_ha, source_note, yield_level, demand_group, source_table, nutrient_form, max_dose_kg_ha, min_dose_kg_ha, crop_profile_id, soil_supply_class, recommendation_type) values
  (1, 'N', 1, '2026-09-09T05:48:09.41806+00:00', 50.0, 'Základní a minimální dávka dusíku pro žito ozimé.', 'low', null, 'Tabulka 18', 'N', null, 15.0, 75, null, 'methodology_base'),
  (2, 'N', 1, '2026-09-09T05:48:09.41806+00:00', 75.0, 'Základní a minimální dávka dusíku pro žito ozimé.', 'medium', null, 'Tabulka 18', 'N', null, 25.0, 75, null, 'methodology_base'),
  (3, 'N', 1, '2026-09-09T05:48:09.41806+00:00', 100.0, 'Základní a minimální dávka dusíku pro žito ozimé.', 'high', null, 'Tabulka 18', 'N', null, 40.0, 75, null, 'methodology_base'),
  (4, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 75.0, 'Žito/obilniny – skupina P 2.', 'low', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'low', 'methodology_table'),
  (5, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 90.0, 'Žito/obilniny – skupina P 2.', 'medium', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'low', 'methodology_table'),
  (6, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 105.0, 'Žito/obilniny – skupina P 2.', 'high', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'low', 'methodology_table'),
  (7, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 60.0, 'Žito/obilniny – skupina P 2.', 'low', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'satisfactory', 'methodology_table'),
  (8, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 70.0, 'Žito/obilniny – skupina P 2.', 'medium', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'satisfactory', 'methodology_table'),
  (9, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 85.0, 'Žito/obilniny – skupina P 2.', 'high', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'satisfactory', 'methodology_table'),
  (10, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 50.0, 'Žito/obilniny – skupina P 2.', 'low', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'good', 'methodology_table'),
  (11, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 60.0, 'Žito/obilniny – skupina P 2.', 'medium', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'good', 'methodology_table'),
  (12, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 70.0, 'Žito/obilniny – skupina P 2.', 'high', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'good', 'methodology_table'),
  (13, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu P tabulka stanovuje nulovou dávku.', 'low', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'high', 'methodology_table'),
  (14, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu P tabulka stanovuje nulovou dávku.', 'medium', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'high', 'methodology_table'),
  (15, 'P', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu P tabulka stanovuje nulovou dávku.', 'high', 2, 'Tabulka 15', 'P2O5', null, null, 75, 'high', 'methodology_table'),
  (16, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 80.0, 'Žito/obilniny – skupina K 4.', 'low', 4, 'Tabulka 16', 'K2O', null, null, 75, 'low', 'methodology_table'),
  (17, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 100.0, 'Žito/obilniny – skupina K 4.', 'medium', 4, 'Tabulka 16', 'K2O', null, null, 75, 'low', 'methodology_table'),
  (18, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 120.0, 'Žito/obilniny – skupina K 4.', 'high', 4, 'Tabulka 16', 'K2O', null, null, 75, 'low', 'methodology_table'),
  (19, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 70.0, 'Žito/obilniny – skupina K 4.', 'low', 4, 'Tabulka 16', 'K2O', null, null, 75, 'satisfactory', 'methodology_table'),
  (20, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 80.0, 'Žito/obilniny – skupina K 4.', 'medium', 4, 'Tabulka 16', 'K2O', null, null, 75, 'satisfactory', 'methodology_table'),
  (21, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 90.0, 'Žito/obilniny – skupina K 4.', 'high', 4, 'Tabulka 16', 'K2O', null, null, 75, 'satisfactory', 'methodology_table'),
  (22, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 60.0, 'Žito/obilniny – skupina K 4.', 'low', 4, 'Tabulka 16', 'K2O', null, null, 75, 'good', 'methodology_table'),
  (23, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 70.0, 'Žito/obilniny – skupina K 4.', 'medium', 4, 'Tabulka 16', 'K2O', null, null, 75, 'good', 'methodology_table'),
  (24, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 80.0, 'Žito/obilniny – skupina K 4.', 'high', 4, 'Tabulka 16', 'K2O', null, null, 75, 'good', 'methodology_table'),
  (25, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu K tabulka stanovuje nulovou dávku.', 'low', 4, 'Tabulka 16', 'K2O', null, null, 75, 'high', 'methodology_table'),
  (26, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu K tabulka stanovuje nulovou dávku.', 'medium', 4, 'Tabulka 16', 'K2O', null, null, 75, 'high', 'methodology_table'),
  (27, 'K', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu K tabulka stanovuje nulovou dávku.', 'high', 4, 'Tabulka 16', 'K2O', null, null, 75, 'high', 'methodology_table'),
  (28, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 30.0, 'Žito/obilniny – skupina Mg 3.', 'low', 3, 'Tabulka 17', 'MgO', null, null, 75, 'low', 'methodology_table'),
  (29, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 45.0, 'Žito/obilniny – skupina Mg 3.', 'medium', 3, 'Tabulka 17', 'MgO', null, null, 75, 'low', 'methodology_table'),
  (30, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 60.0, 'Žito/obilniny – skupina Mg 3.', 'high', 3, 'Tabulka 17', 'MgO', null, null, 75, 'low', 'methodology_table'),
  (31, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 25.0, 'Žito/obilniny – skupina Mg 3.', 'low', 3, 'Tabulka 17', 'MgO', null, null, 75, 'satisfactory', 'methodology_table'),
  (32, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 35.0, 'Žito/obilniny – skupina Mg 3.', 'medium', 3, 'Tabulka 17', 'MgO', null, null, 75, 'satisfactory', 'methodology_table'),
  (33, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 50.0, 'Žito/obilniny – skupina Mg 3.', 'high', 3, 'Tabulka 17', 'MgO', null, null, 75, 'satisfactory', 'methodology_table'),
  (34, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 20.0, 'Žito/obilniny – skupina Mg 3.', 'low', 3, 'Tabulka 17', 'MgO', null, null, 75, 'good', 'methodology_table'),
  (35, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 30.0, 'Žito/obilniny – skupina Mg 3.', 'medium', 3, 'Tabulka 17', 'MgO', null, null, 75, 'good', 'methodology_table'),
  (36, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 40.0, 'Žito/obilniny – skupina Mg 3.', 'high', 3, 'Tabulka 17', 'MgO', null, null, 75, 'good', 'methodology_table'),
  (37, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu Mg tabulka stanovuje nulovou dávku.', 'low', 3, 'Tabulka 17', 'MgO', null, null, 75, 'high', 'methodology_table'),
  (38, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu Mg tabulka stanovuje nulovou dávku.', 'medium', 3, 'Tabulka 17', 'MgO', null, null, 75, 'high', 'methodology_table'),
  (39, 'Mg', 1, '2026-09-09T05:48:09.41806+00:00', 0.0, 'Při vysokém obsahu Mg tabulka stanovuje nulovou dávku.', 'high', 3, 'Tabulka 17', 'MgO', null, null, 75, 'high', 'methodology_table'),
  (40, 'P', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'low', 2, 'Tabulka 9', 'P2O5', null, null, 75, 'very_high', 'methodology_rule'),
  (41, 'P', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'medium', 2, 'Tabulka 9', 'P2O5', null, null, 75, 'very_high', 'methodology_rule'),
  (42, 'P', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'high', 2, 'Tabulka 9', 'P2O5', null, null, 75, 'very_high', 'methodology_rule'),
  (43, 'K', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'low', 4, 'Tabulka 9', 'K2O', null, null, 75, 'very_high', 'methodology_rule'),
  (44, 'K', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'medium', 4, 'Tabulka 9', 'K2O', null, null, 75, 'very_high', 'methodology_rule'),
  (45, 'K', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'high', 4, 'Tabulka 9', 'K2O', null, null, 75, 'very_high', 'methodology_rule'),
  (46, 'Mg', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'low', 3, 'Tabulka 9', 'MgO', null, null, 75, 'very_high', 'methodology_rule'),
  (47, 'Mg', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'medium', 3, 'Tabulka 9', 'MgO', null, null, 75, 'very_high', 'methodology_rule'),
  (48, 'Mg', 1, '2026-09-09T05:50:50.772985+00:00', 0.0, 'Velmi vysoký obsah: hnojení příslušnou živinou se vypouští.', 'high', 3, 'Tabulka 9', 'MgO', null, null, 75, 'very_high', 'methodology_rule')
on conflict (id) do nothing;


-- crop_organic_fertilization: no seed rows in production snapshot.


-- organic_fertilizer_n_credits: 30 rows
insert into public.organic_fertilizer_n_credits (id, notes, source_id, created_at, source_table, livestock_type, fertilizer_type, application_window, effective_n_kg_per_t, year_after_application) values
  (1, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'VIII-IX', 1.5, 1),
  (2, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'VIII-IX', 0.85, 2),
  (3, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'X-II', 1.5, 1),
  (4, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'X-II', 0.85, 2),
  (5, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'III-VII', 1.5, 1),
  (6, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'hnůj', 'III-VII', 0.85, 2),
  (7, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'VIII-IX', 0.6, 1),
  (8, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'VIII-IX', 0.15, 2),
  (9, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'X-II', 0.95, 1),
  (10, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'X-II', 0.15, 2),
  (11, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'III-VII', 1.35, 1),
  (12, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', null, 'močůvka', 'III-VII', 0.25, 2),
  (13, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'VIII-IX', 0.9, 1),
  (14, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'VIII-IX', 0.4, 2),
  (15, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'X-II', 1.3, 1),
  (16, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'X-II', 0.55, 2),
  (17, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'III-VII', 1.5, 1),
  (18, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'skot', 'kejda', 'III-VII', 0.6, 2),
  (19, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'VIII-IX', 1.3, 1),
  (20, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'VIII-IX', 0.55, 2),
  (21, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'X-II', 0.85, 1),
  (22, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'X-II', 0.75, 2),
  (23, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'III-VII', 2.15, 1),
  (24, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'prasata', 'kejda', 'III-VII', 0.9, 2),
  (25, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'VIII-IX', 1.95, 1),
  (26, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'VIII-IX', 1.35, 2),
  (27, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'X-II', 2.8, 1),
  (28, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'X-II', 1.85, 2),
  (29, 'Účinný N v 1. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'III-VII', 3.25, 1),
  (30, 'Účinný N ve 2. roce.', 1, '2026-09-09T05:53:00.807604+00:00', 'Tabulka 19', 'drůbež', 'kejda', 'III-VII', 2.2, 2)
on conflict (id) do nothing;


-- crop_fertilization_adjustments: no seed rows in production snapshot.


-- potassium_magnesium_corrections: 4 rows
insert into public.potassium_magnesium_corrections (id, notes, ratio_max, ratio_min, source_id, created_at, description, source_table, correction_factor) values
  (1, 'Poměr K:Mg do 1,6.', 1.6, null, 1, '2026-09-09T05:53:00.807604+00:00', 'Vypočtená dávka draslíku se zachová.', 'Korekce K:Mg po Tabulce 17', 1.0),
  (2, 'Poměr K:Mg 1,6 až 2,3.', 2.3, 1.6, 1, '2026-09-09T05:53:00.807604+00:00', 'Vypočtená dávka draslíku se násobí koeficientem 0,75.', 'Korekce K:Mg po Tabulce 17', 0.75),
  (3, 'Poměr K:Mg 2,31 až 3,2.', 3.2, 2.31, 1, '2026-09-09T05:53:00.807604+00:00', 'Vypočtená dávka draslíku se násobí koeficientem 0,50.', 'Korekce K:Mg po Tabulce 17', 0.5),
  (4, 'Při poměru K:Mg nad 3,2.', null, 3.2, 1, '2026-09-09T05:53:00.807604+00:00', 'Draselné hnojení se vypouští.', 'Korekce K:Mg po Tabulce 17', 0.0)
on conflict (id) do nothing;


-- nitrogen_predecessor_adjustments: 6 rows
insert into public.nitrogen_predecessor_adjustments (id, notes, source_id, created_at, yield_level, source_table, predecessor_group, adjustment_kg_n_ha) values
  (1, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'low', 'Tabulka 20', 'jeteloviny', -20.0),
  (2, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'medium', 'Tabulka 20', 'jeteloviny', -30.0),
  (3, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'high', 'Tabulka 20', 'jeteloviny', -40.0),
  (4, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'low', 'Tabulka 20', 'luskoviny', -20.0),
  (5, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'medium', 'Tabulka 20', 'luskoviny', -20.0),
  (6, 'Korekce dávky N podle předplodiny.', 1, '2026-09-09T05:53:00.807604+00:00', 'high', 'Tabulka 20', 'luskoviny', -20.0)
on conflict (id) do nothing;


-- soil_nutrient_classification_rules: 40 rows
insert into public.soil_nutrient_classification_rules (id, notes, land_use, nutrient, max_mg_kg, min_mg_kg, source_id, created_at, source_table, supply_class, analytical_method, soil_texture_class) values
  (1, 'Orná půda, Mehlich 3.', 'arable', 'P', 50.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', 'SP', null),
  (2, 'Orná půda, Mehlich 3.', 'arable', 'P', 80.0, 51.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', 'SP', null),
  (3, 'Orná půda, Mehlich 3.', 'arable', 'P', 115.0, 81.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', 'SP', null),
  (4, 'Orná půda, Mehlich 3.', 'arable', 'P', 185.0, 116.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', 'SP', null),
  (5, 'Orná půda, Mehlich 3.', 'arable', 'P', null, 185.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', 'SP', null),
  (6, 'Orná půda, Mehlich 3.', 'arable', 'P', 55.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', 'ICP-OES', null),
  (7, 'Orná půda, Mehlich 3.', 'arable', 'P', 85.0, 56.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', 'ICP-OES', null),
  (8, 'Orná půda, Mehlich 3.', 'arable', 'P', 125.0, 86.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', 'ICP-OES', null),
  (9, 'Orná půda, Mehlich 3.', 'arable', 'P', 200.0, 126.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', 'ICP-OES', null),
  (10, 'Orná půda, Mehlich 3.', 'arable', 'P', null, 200.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', 'ICP-OES', null),
  (11, 'Orná půda.', 'arable', 'K', 100.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'light'),
  (12, 'Orná půda.', 'arable', 'K', 160.0, 101.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'light'),
  (13, 'Orná půda.', 'arable', 'K', 275.0, 161.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'light'),
  (14, 'Orná půda.', 'arable', 'K', 380.0, 276.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'light'),
  (15, 'Orná půda.', 'arable', 'K', null, 380.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'light'),
  (16, 'Orná půda.', 'arable', 'K', 105.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'medium'),
  (17, 'Orná půda.', 'arable', 'K', 170.0, 106.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'medium'),
  (18, 'Orná půda.', 'arable', 'K', 310.0, 171.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'medium'),
  (19, 'Orná půda.', 'arable', 'K', 420.0, 311.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'medium'),
  (20, 'Orná půda.', 'arable', 'K', null, 420.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'medium'),
  (21, 'Orná půda.', 'arable', 'K', 170.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'heavy'),
  (22, 'Orná půda.', 'arable', 'K', 260.0, 171.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'heavy'),
  (23, 'Orná půda.', 'arable', 'K', 350.0, 261.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'heavy'),
  (24, 'Orná půda.', 'arable', 'K', 510.0, 351.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'heavy'),
  (25, 'Orná půda.', 'arable', 'K', null, 510.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'heavy'),
  (26, 'Orná půda.', 'arable', 'Mg', 80.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'light'),
  (27, 'Orná půda.', 'arable', 'Mg', 135.0, 81.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'light'),
  (28, 'Orná půda.', 'arable', 'Mg', 200.0, 136.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'light'),
  (29, 'Orná půda.', 'arable', 'Mg', 285.0, 201.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'light'),
  (30, 'Orná půda.', 'arable', 'Mg', null, 285.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'light'),
  (31, 'Orná půda.', 'arable', 'Mg', 105.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'medium'),
  (32, 'Orná půda.', 'arable', 'Mg', 160.0, 106.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'medium'),
  (33, 'Orná půda.', 'arable', 'Mg', 265.0, 161.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'medium'),
  (34, 'Orná půda.', 'arable', 'Mg', 330.0, 266.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'medium'),
  (35, 'Orná půda.', 'arable', 'Mg', null, 330.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'medium'),
  (36, 'Orná půda.', 'arable', 'Mg', 120.0, null, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'low', null, 'heavy'),
  (37, 'Orná půda.', 'arable', 'Mg', 220.0, 121.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'satisfactory', null, 'heavy'),
  (38, 'Orná půda.', 'arable', 'Mg', 330.0, 221.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'good', null, 'heavy'),
  (39, 'Orná půda.', 'arable', 'Mg', 460.0, 331.0, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'high', null, 'heavy'),
  (40, 'Orná půda.', 'arable', 'Mg', null, 460.01, 1, '2026-09-09T06:32:12.512743+00:00', 'Tabulka 6', 'very_high', null, 'heavy')
on conflict (id) do nothing;


commit;
