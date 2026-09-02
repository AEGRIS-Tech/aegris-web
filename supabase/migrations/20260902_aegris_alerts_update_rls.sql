-- Securely mark an AEGRIS alert as read without granting
-- authenticated users general UPDATE access to aegris_alerts.

create or replace function public.mark_aegris_alert_read(
  p_alert_id bigint
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated boolean := false;
begin
  if auth.role() is distinct from 'authenticated' then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if p_alert_id is null or p_alert_id <= 0 then
    raise exception 'Invalid alert id'
      using errcode = '22023';
  end if;

  update public.aegris_alerts a
  set is_read = true
  from public.projects p
  where a.id = p_alert_id
    and p.id = a.project_id
    and p.organization_id is not null
    and public.has_organization_role(
      p.organization_id,
      array['owner', 'admin', 'member']::text[]
    )
  returning true
  into v_updated;

  return coalesce(v_updated, false);
end;
$$;

revoke all
on function public.mark_aegris_alert_read(bigint)
from public;

revoke all
on function public.mark_aegris_alert_read(bigint)
from anon;

grant execute
on function public.mark_aegris_alert_read(bigint)
to authenticated;
