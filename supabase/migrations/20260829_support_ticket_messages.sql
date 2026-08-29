begin;

create table if not exists public.support_ticket_messages (
  id bigserial primary key,

  ticket_id bigint not null
    references public.support_tickets(id)
    on delete cascade,

  author_user_id uuid,

  author_role text not null
    check (author_role in ('customer', 'admin')),

  message text not null
    check (
      char_length(trim(message)) >= 1
      and char_length(message) <= 10000
    ),

  created_at timestamptz not null default now()
);

create index if not exists
  support_ticket_messages_ticket_id_created_at_idx
on public.support_ticket_messages(
  ticket_id,
  created_at asc
);

alter table public.support_ticket_messages
  enable row level security;

grant select, insert
on table public.support_ticket_messages
to authenticated;

grant usage, select
on sequence public.support_ticket_messages_id_seq
to authenticated;

grant select, insert, update
on table public.support_ticket_messages
to service_role;

grant usage, select
on sequence public.support_ticket_messages_id_seq
to service_role;

drop policy if exists
  "support_messages_customer_select"
on public.support_ticket_messages;

create policy
  "support_messages_customer_select"
on public.support_ticket_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_tickets t
    where t.id = support_ticket_messages.ticket_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists
  "support_messages_customer_insert"
on public.support_ticket_messages;

create policy
  "support_messages_customer_insert"
on public.support_ticket_messages
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and author_role = 'customer'
  and exists (
    select 1
    from public.support_tickets t
    where t.id = support_ticket_messages.ticket_id
      and t.user_id = auth.uid()
      and t.status in ('open', 'in_progress')
  )
);

commit;
