-- Supabase schema for Jobortunity

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  created_at timestamptz default now(),
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
  constraint job_postings_source_external_unique unique (source_id, external_id),
  constraint job_postings_company_role_check check (length(company) > 0 and length(role) > 0)
);

-- Enums for data consistency
create type if not exists match_status as enum (
  'prospecting', 'applied', 'interviewing', 'offer', 'hired', 'archived'
);

create type if not exists match_priority as enum (
  'Low', 'Medium', 'High'
);

create type if not exists task_status as enum (
  'pending', 'scheduled', 'completed', 'cancelled'
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  posting_id uuid not null references public.job_postings (id) on delete cascade,
  status match_status not null default 'prospecting',
  priority match_priority not null default 'Medium',
  fit_score integer default 70 check (fit_score >= 0 and fit_score <= 100),
  tags text[] default '{}',
  notes text[] default '{}',
  last_touchpoint timestamptz default now(),
  follow_up_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint job_matches_user_posting_unique unique (user_id, posting_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  title text not null check (length(title) > 0),
  category text not null check (length(category) > 0),
  due_at timestamptz,
  status task_status not null default 'pending',
  auto_generated boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists job_matches_user_idx on public.job_matches (user_id);
create index if not exists job_postings_source_idx on public.job_postings (source_id);
create index if not exists job_postings_owner_idx on public.job_postings (owner_id);
create index if not exists tasks_match_idx on public.tasks (match_id);

-- Partial index for follow-up queries (only indexes rows with future follow_up_at)
create index if not exists job_matches_follow_up_idx 
  on public.job_matches (follow_up_at, user_id) 
  where follow_up_at is not null and follow_up_at > now();

-- Index for due tasks
create index if not exists tasks_due_idx 
  on public.tasks (due_at, status) 
  where due_at is not null and status != 'completed';

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

-- Triggers for automatic updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers to tables with updated_at columns
drop trigger if exists update_job_postings_updated_at on public.job_postings;
create trigger update_job_postings_updated_at
  before update on public.job_postings
  for each row execute function update_updated_at_column();

drop trigger if exists update_job_matches_updated_at on public.job_matches;
create trigger update_job_matches_updated_at
  before update on public.job_matches
  for each row execute function update_updated_at_column();

drop trigger if exists update_tasks_updated_at on public.tasks;
create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at_column();

-- Function to get next actions for a user
create or replace function get_next_actions(p_user_id uuid, p_limit int default 10)
returns table (
  match_id uuid,
  company text,
  role text,
  action_type text,
  due_at timestamptz,
  priority match_priority
) as $$
begin
  return query
  select 
    jm.id as match_id,
    jp.company,
    jp.role,
    case 
      when jm.follow_up_at is not null and jm.follow_up_at <= now() + interval '7 days' then 'follow_up'
      when jm.status = 'prospecting' and jm.fit_score >= 80 then 'apply'
      when jm.status = 'applied' then 'check_status'
      else 'research'
    end as action_type,
    coalesce(jm.follow_up_at, jm.last_touchpoint + interval '7 days') as due_at,
    jm.priority
  from public.job_matches jm
  join public.job_postings jp on jm.posting_id = jp.id
  where jm.user_id = p_user_id
    and jm.status not in ('hired', 'archived')
  order by 
    case when jm.follow_up_at is not null and jm.follow_up_at <= now() then 0 else 1 end,
    jm.priority desc,
    due_at asc
  limit p_limit;
end;
$$ language plpgsql security definer;
