-- CV Smart — Migrare: pipeline AI de generare descrieri experiență
-- Rulează acest SQL în Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vhhvywptbntlhykkznpk/sql/new
--
-- Adaptări față de specificația inițială (aplicația nu are auth — sesiuni guest):
--   • user_id este nullable, fără FK către auth.users
--   • wizard_session_id leagă pipeline-ul de sesiunea wizard existentă
--   • job_description stocat per pipeline (ancorarea CV-ului pe anunțul țintă)

create table if not exists cv_pipeline_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  wizard_session_id uuid references sessions(id) on delete set null,
  job_title text not null,
  company text,
  period text,
  industry text,
  years_experience int,
  raw_text text not null,
  job_description text,
  stage text not null default 'analyzed'
    check (stage in ('analyzed', 'answered', 'synthesized', 'generated', 'completed')),
  extraction_result jsonb,   -- output Etapa 1 (fapte + goluri + întrebări)
  user_answers jsonb,        -- răspunsurile userului [{questionId, answer}]
  fact_sheet jsonb,          -- output Etapa 2
  generated_bullets jsonb,   -- output Etapa 3 (bullet-urile validate)
  selected_bullet_ids jsonb, -- ce a ales userul
  rejected_bullet_ids jsonb, -- ce NU a ales
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cv_pipeline_wizard_session
  on cv_pipeline_sessions (wizard_session_id);

alter table cv_pipeline_sessions enable row level security;

create policy "Service role can do everything on cv_pipeline_sessions"
  on cv_pipeline_sessions for all using (true) with check (true);
