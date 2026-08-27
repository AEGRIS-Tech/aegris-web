-- AEGRIS: server-authoritative analysis hardening
-- Apply only after deploying the matching application code.
begin;

-- 1) NDVI history must always reference a real project.
do $$
begin
  if exists (
    select 1 from public.ndvi_history h
    left join public.projects p on p.id = h.project_id
    where p.id is null
  ) then
    raise exception 'Cannot add ndvi_history FK: orphan project_id values exist';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ndvi_history'::regclass
      and contype = 'f'
      and conname = 'ndvi_history_project_id_fkey'
  ) then
    alter table public.ndvi_history
      add constraint ndvi_history_project_id_fkey
      foreign key (project_id) references public.projects(id)
      on delete cascade;
  end if;
end $$;

-- 2) Browser may read authoritative outputs, but may not create/change them.
drop policy if exists "Allow authenticated insert analysis" on public.analysis;
drop policy if exists "Users can insert own AEGRIS recommendations" on public.aegris_recommendations;
drop policy if exists "Users can update own AEGRIS recommendations" on public.aegris_recommendations;
drop policy if exists "Users can insert own AEGRIS alerts" on public.aegris_alerts;
drop policy if exists "Users can update own AEGRIS alerts" on public.aegris_alerts;

revoke insert, update, delete on table public.analysis from authenticated;
revoke insert, update, delete on table public.aegris_recommendations from authenticated;
revoke insert, update, delete on table public.aegris_alerts from authenticated;

-- 3) The only client-side alert mutation is marking an owned alert as read.
create or replace function public.mark_aegris_alert_read(p_alert_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.aegris_alerts a
     set is_read = true
   where a.id = p_alert_id
     and exists (
       select 1
       from public.projects p
       where p.id = a.project_id
         and p.user_id = auth.uid()
     );

  if not found then
    raise exception 'Alert not found or access denied';
  end if;
end;
$$;

revoke all on function public.mark_aegris_alert_read(bigint) from public;
grant execute on function public.mark_aegris_alert_read(bigint) to authenticated;

commit;
