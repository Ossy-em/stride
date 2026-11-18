-- Steps inside a goal: a small checklist under each goal.
-- Run once in the Supabase SQL editor after add-goals.sql. Safe to run again.

create table if not exists public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

create index if not exists goal_steps_goal_idx on public.goal_steps (goal_id, position);

alter table public.goal_steps enable row level security;
