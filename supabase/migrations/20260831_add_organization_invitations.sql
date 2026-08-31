create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  email text not null,

  role text not null default 'member'
    check (
      role = any (
        array[
          'admin'::text,
          'member'::text,
          'viewer'::text
        ]
      )
    ),

  invited_by uuid
  references auth.users(id)
  on delete set null,

  token uuid not null default gen_random_uuid(),

  status text not null default 'pending'
    check (
      status = any (
        array[
          'pending'::text,
          'accepted'::text,
          'revoked'::text,
          'expired'::text
        ]
      )
    ),

  created_at timestamptz not null default now(),

  expires_at timestamptz not null
    default (now() + interval '7 days'),

  accepted_at timestamptz,

  accepted_by uuid
    references auth.users(id)
    on delete set null
);

create unique index if not exists organization_invitations_token_key
  on public.organization_invitations(token);

create unique index if not exists organization_invitations_pending_unique
  on public.organization_invitations(
    organization_id,
    lower(email)
  )
  where status = 'pending';

create index if not exists organization_invitations_organization_id_idx
  on public.organization_invitations(organization_id);

create index if not exists organization_invitations_email_idx
  on public.organization_invitations(lower(email));

create index if not exists organization_invitations_status_idx
  on public.organization_invitations(status);

alter table public.organization_invitations
  enable row level security;

revoke all
  on table public.organization_invitations
  from anon,
       authenticated;

grant select,
      insert,
      update,
      delete
  on table public.organization_invitations
  to service_role;

drop policy if exists
  "organization_invitations_service_role_all"
  on public.organization_invitations;

create policy
  "organization_invitations_service_role_all"
  on public.organization_invitations
  for all
  to service_role
  using (true)
  with check (true);