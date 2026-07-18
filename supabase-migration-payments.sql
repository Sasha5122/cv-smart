-- Migrație: statusuri de plată + template-ul Minimalist.
-- OPȚIONALĂ: aplicația funcționează și fără ea (plățile se țin în `events`),
-- dar rularea ei repune coloanele sessions.status / template_id în funcțiune.
-- Rulare: Supabase Dashboard → SQL Editor → paste → Run.

alter table sessions drop constraint if exists sessions_status_check;
alter table sessions add constraint sessions_status_check
  check (status in ('in_progress', 'draft_generated', 'paid', 'downloaded', 'contact_anchor'));

alter table sessions drop constraint if exists sessions_template_id_check;
alter table sessions add constraint sessions_template_id_check
  check (template_id in ('classic', 'modern', 'elegant', 'compact', 'minimal'));
