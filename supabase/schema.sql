-- Supabase schema for Jobortunity

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
npm  created_at timestamptz default now(),
  constraint job_sources_name_unique unique (name)
);

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources (id) on delete set null,
  external_id text,
  owner_id uuid,
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
  updated_at timestamptz default now(),
  constraint job_postings_source_external_unique unique (source_id, external_id)
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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
create index if not exists job_postings_owner_idx on public.job_postings (owner_id);
create index if not exists tasks_match_idx on public.tasks (match_id);

alter table public.job_matches enable row level security;
alter table public.job_postings enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Allow read access to matches" on public.job_matches;
drop policy if exists "Allow read access to postings" on public.job_postings;
drop policy if exists "Allow read access to tasks" on public.tasks;
drop policy if exists "Users can manage own matches" on public.job_matches;
drop policy if exists "Users can view related postings" on public.job_postings;
drop policy if exists "Users can manage own postings" on public.job_postings;
drop policy if exists "Users can manage own tasks" on public.tasks;

create policy "Users can manage own matches" on public.job_matches
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view related postings" on public.job_postings
  for select using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.job_matches jm
      where jm.posting_id = job_postings.id
        and jm.user_id = auth.uid()
    )
  );

create policy "Users can manage own postings" on public.job_postings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users can manage own tasks" on public.tasks
  using (
    exists (
      select 1
      from public.job_matches jm
      where jm.id = tasks.match_id
        and jm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.job_matches jm
      where jm.id = tasks.match_id
        and jm.user_id = auth.uid()
    )
  );
