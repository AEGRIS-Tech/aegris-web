begin;

alter table public.support_tickets
enable row level security;

drop policy if exists "support_tickets_select_own"
on public.support_tickets;

create policy "support_tickets_select_own"
on public.support_tickets
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "support_tickets_insert_own"
on public.support_tickets;

create policy "support_tickets_insert_own"
on public.support_tickets
for insert
to authenticated
with check (
  auth.uid() = user_id
);

grant select, insert
on table public.support_tickets
to authenticated;

grant usage, select
on sequence public.support_tickets_id_seq
to authenticated;

grant select, insert, update
on table public.support_tickets
to service_role;

grant usage, select
on sequence public.support_tickets_id_seq
to service_role;

commit;