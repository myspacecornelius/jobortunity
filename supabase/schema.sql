-- Supabase schema for Jobortunity

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  created_at timestamptz default now()
);

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources (id) on delete set null,
  external_id text,
  company text not null,
  role text not null,
  location text,
  remote boolean default false,
  job_type text,
  seniority text,
  description text,
  url text,
  keywords text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  posting_id uuid not null references public.job_postings (id) on delete cascade,
  status text not null default 'prospecting',
  priority text not null default 'Medium',
  fit_score integer default 70,
  tags text[] default '{}',
  notes text[] default '{}',
  last_touchpoint timestamptz default now(),
  follow_up_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  title text not null,
  category text not null,
  due_at timestamptz,
  status text not null default 'pending',
  auto_generated boolean default false,
  created_at timestamptz default now()
);

create index if not exists job_matches_user_idx on public.job_matches (user_id);
create index if not exists job_postings_source_idx on public.job_postings (source_id);
create index if not exists tasks_match_idx on public.tasks (match_id);

alter table public.job_matches enable row level security;
alter table public.job_postings enable row level security;
alter table public.tasks enable row level security;

create policy "Allow read access to matches" on public.job_matches
  for select using (true);

create policy "Allow read access to postings" on public.job_postings
  for select using (true);

create policy "Allow read access to tasks" on public.tasks
  for select using (true);
