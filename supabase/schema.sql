-- Digital Ink starter schema
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  service text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_demo_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  demo_name text not null,
  input_summary text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.ai_demo_events enable row level security;

-- Production policies should be added after deciding whether submissions
-- are sent through an Edge Function or directly from an authenticated app.
-- Keep service-role credentials server-side.
