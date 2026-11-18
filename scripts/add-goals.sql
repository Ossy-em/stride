-- Goals: named goals that sessions link to, plus a weekly focus target.
-- Run once in the Supabase SQL editor. Safe to run again.

-- goals.user_id must match the type of users.id, so read it first
do $$
declare uid_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into uid_type
  from pg_attribute a
  where a.attrelid = 'public.users'::regclass and a.attname = 'id';

  execute format($f$
    create table if not exists public.goals (
      id uuid primary key default gen_random_uuid(),
      user_id %s not null references public.users(id) on delete cascade,
      title text not null check (char_length(title) between 1 and 120),
      target_minutes integer check (target_minutes is null or target_minutes > 0),
      due_date date,
      status text not null default 'active' check (status in ('active', 'completed')),
      created_at timestamptz not null default now(),
      completed_at timestamptz
    )
  $f$, uid_type);
end $$;

create index if not exists goals_user_status_idx on public.goals (user_id, status);

-- the app talks to Supabase with the service role; keep the table closed to anon/public keys
alter table public.goals enable row level security;

-- a session can count towards one goal
alter table public.sessions
  add column if not exists goal_id uuid references public.goals(id) on delete set null;
create index if not exists sessions_goal_idx on public.sessions (goal_id);

-- weekly focus target in minutes, null = none
alter table public.users
  add column if not exists weekly_target_minutes integer
  check (weekly_target_minutes is null or weekly_target_minutes > 0);
