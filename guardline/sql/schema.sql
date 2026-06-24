-- GuardLine v3.1 — run this in Supabase SQL Editor
-- https://supabase.com/dashboard → your project → SQL Editor → New query

-- Guards (replaces roster.json)
create table if not exists guards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text unique not null,
  default_site text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Incidents (replaces Google Sheets)
create table if not exists incidents (
  id text primary key,
  timestamp timestamptz default now(),
  guard_phone text,
  guard_name text,
  guard_known boolean default true,
  site_name text,
  intent text,
  severity text,
  confidential boolean default false,
  summary text,
  suspect_description text,
  cctv_zone text,
  police_called boolean,
  occurrence_number text,
  full_conversation jsonb,
  escalated boolean default false,
  escalated_at timestamptz,
  escalation_source text,
  shiftfill_triggered boolean default false,
  resolved boolean default false,
  incident_report text,
  notes text
);
alter table incidents enable row level security;

-- Pending escalations (replaces SQLite / setTimeout)
create table if not exists pending_escalations (
  id uuid default gen_random_uuid() primary key,
  incident_id text references incidents(id),
  guard_phone text,
  site text,
  message text,
  fire_at timestamptz not null,
  fired boolean default false,
  fired_at timestamptz
);

-- Conversations (replaces in-memory Map)
create table if not exists conversations (
  guard_phone text primary key,
  site text,
  history jsonb default '[]',
  last_active timestamptz default now(),
  active_incident_id text
);

-- Documents (PDF files in Supabase Storage)
create table if not exists documents (
  key text primary key,
  label text not null,
  url text not null,
  active boolean default true
);

-- Seed documents — update URLs after uploading PDFs to Storage bucket
insert into documents (key, label, url) values
  ('payroll', 'Payroll Schedule', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/documents/payroll.pdf'),
  ('incident_report', 'Incident Report Form', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/documents/incident_report_form.pdf'),
  ('trespass_notice', 'Trespass Notice Template', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/documents/trespass_notice.pdf'),
  ('site_contacts', 'Site Contact List', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/documents/site_contacts.pdf'),
  ('uniform_policy', 'Uniform Policy', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/documents/uniform_policy.pdf')
on conflict (key) do nothing;

-- Test guard — replace phone with your WhatsApp number (Twilio sandbox format)
-- insert into guards (name, phone, default_site) values
--   ('Test Guard', 'whatsapp:+1YOURNUMBER', 'Metro');
