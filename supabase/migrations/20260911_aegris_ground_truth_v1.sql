alter table public.field_validations
  add column if not exists observed_severity smallint,
  add column if not exists prediction_snapshot jsonb;

alter table public.field_validations
  drop constraint if exists field_validations_observed_severity_check;

alter table public.field_validations
  add constraint field_validations_observed_severity_check
  check (
    observed_severity is null
    or observed_severity between 0 and 5
  );

create index if not exists field_validations_project_observed_at_idx
  on public.field_validations (project_id, observed_at desc);

comment on column public.field_validations.observed_severity is
  'Skutečná závažnost nálezu při terénní kontrole: 0 = bez problému, 5 = velmi závažný stav.';

comment on column public.field_validations.prediction_snapshot is
  'Neměnný historický snapshot výstupu AEGRIS vztahujícího se k ověřované analýze.';
