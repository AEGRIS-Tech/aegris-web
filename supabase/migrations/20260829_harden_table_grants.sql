begin;

revoke all privileges
on table public.admin_audit_log
from anon, authenticated;

revoke all privileges
on table public.admin_audit_log
from service_role;

grant select, insert
on table public.admin_audit_log
to service_role;

revoke all privileges
on table public.support_tickets
from anon, authenticated, service_role;

grant select, insert
on table public.support_tickets
to authenticated;

grant select, insert, update
on table public.support_tickets
to service_role;

revoke all privileges
on table public.support_ticket_messages
from anon, authenticated, service_role;

grant select, insert
on table public.support_ticket_messages
to authenticated;

grant select, insert, update
on table public.support_ticket_messages
to service_role;

commit;
