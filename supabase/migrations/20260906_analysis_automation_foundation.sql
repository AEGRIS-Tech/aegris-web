-- AegRIS
-- Analysis automation foundation
-- 2026-09-06
--
-- Source-of-truth pro analysis_locks a příprava locku
-- pro ruční i automaticky spouštěné analýzy.
--
-- project_id zůstává PRIMARY KEY:
-- jeden projekt = maximálně jedna současně běžící analýza.
--
-- user_id:
--   UUID    = ručně spuštěná analýza konkrétním uživatelem
--   NULL    = automaticky spuštěná serverová analýza

create table if not exists public.analysis_locks (
  project_id bigint primary key
    references public.projects(id)
    on delete cascade,

  user_id uuid,

  locked_at timestamp with time zone
    not null
    default now()
);

-- Produkční tabulka analysis_locks historicky vznikla mimo
-- verzované migrace a user_id je v ní aktuálně NOT NULL.
--
-- Automatická analýza nemá přihlášeného uživatele,
-- proto musí být user_id nullable.
alter table public.analysis_locks
  alter column user_id drop not null;

-- Zachováme index používaný pro dohledání locků podle uživatele.
create index if not exists analysis_locks_user_id_idx
  on public.analysis_locks (user_id);

comment on table public.analysis_locks is
  'Project-level lock preventing concurrent manual and scheduled AegRIS analyses.';

comment on column public.analysis_locks.user_id is
  'Authenticated user for manual analysis; NULL for server-scheduled analysis.';