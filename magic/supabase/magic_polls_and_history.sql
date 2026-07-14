-- Multi-device live polls + anonymous court feed
-- Run in Hazel Supabase SQL editor (safe re-run)

create table if not exists public.magic_polls (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null default 'Hearth Court poll',
  sides jsonb not null default '[]'::jsonb,
  host_id text,
  host_email text,
  anonymous boolean default false,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists magic_polls_code_idx on public.magic_polls (code);
create index if not exists magic_polls_status_idx on public.magic_polls (status);

create table if not exists public.magic_poll_votes (
  id bigserial primary key,
  poll_code text not null references public.magic_polls(code) on delete cascade,
  side_id text not null,
  voter_key text not null,
  created_at timestamptz not null default now(),
  unique (poll_code, voter_key)
);

create table if not exists public.magic_anon_court (
  id uuid primary key default gen_random_uuid(),
  sides jsonb not null default '[]'::jsonb,
  winner text,
  shared boolean default false,
  cliff_note text,
  summary text,
  created_at timestamptz not null default now()
);

alter table public.magic_polls enable row level security;
alter table public.magic_poll_votes enable row level security;
alter table public.magic_anon_court enable row level security;

drop policy if exists "magic_polls_read" on public.magic_polls;
create policy "magic_polls_read" on public.magic_polls
  for select to anon, authenticated using (true);

drop policy if exists "magic_polls_insert" on public.magic_polls;
create policy "magic_polls_insert" on public.magic_polls
  for insert to anon, authenticated with check (true);

drop policy if exists "magic_polls_update" on public.magic_polls;
create policy "magic_polls_update" on public.magic_polls
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "magic_votes_insert" on public.magic_poll_votes;
create policy "magic_votes_insert" on public.magic_poll_votes
  for insert to anon, authenticated with check (true);

drop policy if exists "magic_votes_read" on public.magic_poll_votes;
create policy "magic_votes_read" on public.magic_poll_votes
  for select to anon, authenticated using (true);

drop policy if exists "magic_anon_read" on public.magic_anon_court;
create policy "magic_anon_read" on public.magic_anon_court
  for select to anon, authenticated using (true);

drop policy if exists "magic_anon_insert" on public.magic_anon_court;
create policy "magic_anon_insert" on public.magic_anon_court
  for insert to anon, authenticated with check (true);

grant select, insert, update on public.magic_polls to anon, authenticated;
grant select, insert on public.magic_poll_votes to anon, authenticated;
grant select, insert on public.magic_anon_court to anon, authenticated;
grant usage, select on sequence public.magic_poll_votes_id_seq to anon, authenticated;

-- Per-user activity history (dashboard Results / History cloud sync)
create table if not exists public.magic_user_history (
  id bigserial primary key,
  user_id text not null,
  user_email text,
  entry_id text not null unique,
  entry_type text,
  title text,
  summary text,
  payload jsonb default '{}'::jsonb,
  anonymous boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists magic_user_history_user_idx on public.magic_user_history (user_id);

alter table public.magic_user_history enable row level security;

drop policy if exists "magic_hist_select_own" on public.magic_user_history;
create policy "magic_hist_select_own" on public.magic_user_history
  for select to authenticated
  using (
    user_id = coalesce(auth.uid()::text, '')
    or lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "magic_hist_insert_own" on public.magic_user_history;
create policy "magic_hist_insert_own" on public.magic_user_history
  for insert to authenticated
  with check (
    user_id = coalesce(auth.uid()::text, '')
    or lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "magic_hist_update_own" on public.magic_user_history;
create policy "magic_hist_update_own" on public.magic_user_history
  for update to authenticated
  using (
    user_id = coalesce(auth.uid()::text, '')
    or lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

grant select, insert, update on public.magic_user_history to authenticated;
grant usage, select on sequence public.magic_user_history_id_seq to authenticated;
