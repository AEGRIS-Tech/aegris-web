begin;

alter table public.profiles
  add column if not exists system_role text;

update public.profiles
set system_role = 'user'
where system_role is null;

alter table public.profiles
  alter column system_role set default 'user';

alter table public.profiles
  alter column system_role set not null;

alter table public.profiles
  drop constraint if exists profiles_system_role_check;

alter table public.profiles
  add constraint profiles_system_role_check
  check (system_role in ('user', 'admin'));

commit;