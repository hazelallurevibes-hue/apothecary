-- Magic Sanctum celestial profile columns on shared users table
-- Run in Hazel Supabase SQL editor (safe re-run)

alter table public.users add column if not exists date_of_birth date;
alter table public.users add column if not exists western_sign text;
alter table public.users add column if not exists chinese_animal text;
alter table public.users add column if not exists chinese_element text;
alter table public.users add column if not exists life_path_number int;
alter table public.users add column if not exists celestial_profile jsonb;

comment on column public.users.date_of_birth is 'Seeker DOB for Magic Sanctum / profile chart (optional)';
comment on column public.users.celestial_profile is 'JSON chart: western, chinese, celtic, mayan, lifePath';
