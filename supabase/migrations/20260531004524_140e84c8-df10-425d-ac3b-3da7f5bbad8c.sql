
-- Portal: attendee accounts + bookmarks + hackathon + networking

create table public.attendee_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  registration_id uuid unique references public.registrations(id) on delete set null,
  display_name text,
  headline text,
  bio text,
  avatar_url text,
  linkedin_url text,
  networking_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.attendee_profiles to authenticated;
grant all on public.attendee_profiles to service_role;
alter table public.attendee_profiles enable row level security;

-- helpers
create or replace function public.is_checked_in(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.attendee_profiles ap
    join public.registrations r on r.id = ap.registration_id
    where ap.user_id = _user_id and r.checked_in_at is not null
  );
$$;

create policy "Own profile read" on public.attendee_profiles
  for select to authenticated
  using (user_id = auth.uid());

create policy "Checked-in can see opted-in directory" on public.attendee_profiles
  for select to authenticated
  using (
    networking_opt_in = true
    and public.is_checked_in(auth.uid())
    and exists (
      select 1 from public.registrations r
      where r.id = attendee_profiles.registration_id
        and r.checked_in_at is not null
    )
  );

create policy "Own profile insert" on public.attendee_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Own profile update" on public.attendee_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- session bookmarks (sessions are static slugs from event-data.ts)
create table public.session_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);
grant select, insert, delete on public.session_bookmarks to authenticated;
grant all on public.session_bookmarks to service_role;
alter table public.session_bookmarks enable row level security;
create policy "Own bookmarks" on public.session_bookmarks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- hackathon / pitch entries
create table public.hackathon_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track text not null check (track in ('hackathon','pitch')),
  project_name text,
  summary text,
  problem text,
  solution text,
  deck_url text,
  repo_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft','submitted','shortlisted','rejected')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index hackathon_entries_one_per_user on public.hackathon_entries(user_id);
grant select, insert, update, delete on public.hackathon_entries to authenticated;
grant all on public.hackathon_entries to service_role;
alter table public.hackathon_entries enable row level security;
create policy "Own entry" on public.hackathon_entries
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins read all entries" on public.hackathon_entries
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.hackathon_team_members (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.hackathon_entries(id) on delete cascade,
  email text not null,
  full_name text,
  role text,
  invited_at timestamptz not null default now(),
  accepted_user_id uuid references auth.users(id) on delete set null
);
grant select, insert, update, delete on public.hackathon_team_members to authenticated;
grant all on public.hackathon_team_members to service_role;
alter table public.hackathon_team_members enable row level security;
create policy "Owner manages team" on public.hackathon_team_members
  for all to authenticated
  using (exists (select 1 from public.hackathon_entries e where e.id = entry_id and e.user_id = auth.uid()))
  with check (exists (select 1 from public.hackathon_entries e where e.id = entry_id and e.user_id = auth.uid()));

-- networking connections
create table public.networking_connections (
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  primary key (from_user, to_user),
  check (from_user <> to_user)
);
grant select, insert, update, delete on public.networking_connections to authenticated;
grant all on public.networking_connections to service_role;
alter table public.networking_connections enable row level security;
create policy "Own outgoing connections" on public.networking_connections
  for all to authenticated
  using (from_user = auth.uid())
  with check (from_user = auth.uid());
create policy "See incoming (no note)" on public.networking_connections
  for select to authenticated using (to_user = auth.uid());

-- updated_at trigger reuse
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger attendee_profiles_touch before update on public.attendee_profiles
  for each row execute function public.touch_updated_at();
create trigger hackathon_entries_touch before update on public.hackathon_entries
  for each row execute function public.touch_updated_at();
