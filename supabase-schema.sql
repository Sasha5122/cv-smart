-- CV Smart — Supabase Schema
-- Rulează acest SQL în Supabase SQL Editor: https://supabase.com/dashboard/project/vhhvywptbntlhykkznpk/sql

-- Sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  email text,
  status text default 'in_progress' check (status in ('in_progress', 'draft_generated', 'downloaded')),
  cv_data jsonb default '{}',
  job_description text,
  ideal_profile jsonb,
  draft_cv text,
  final_cv text,
  photo_url text,
  template_id text default 'classic' check (template_id in ('classic', 'modern', 'elegant', 'compact')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

-- Cached profiles table
create table if not exists cached_profiles (
  id uuid primary key default gen_random_uuid(),
  role_normalized text unique not null,
  role_display text,
  industry text,
  profile_data jsonb,
  source_urls text[],
  created_at timestamptz default now(),
  last_used_at timestamptz default now()
);

-- Events table (analytics)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete set null,
  event_name text not null,
  properties jsonb default '{}',
  created_at timestamptz default now()
);

-- Auto-cleanup expired sessions (optional — run as cron job)
-- delete from sessions where expires_at < now();

-- Row Level Security (disable pentru server-side service role)
alter table sessions enable row level security;
alter table cached_profiles enable row level security;
alter table events enable row level security;

-- Allow service role full access (bypass RLS)
create policy "Service role can do everything on sessions"
  on sessions for all using (true) with check (true);

create policy "Service role can do everything on cached_profiles"
  on cached_profiles for all using (true) with check (true);

create policy "Service role can do everything on events"
  on events for all using (true) with check (true);
