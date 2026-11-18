-- Weekly review on Home: one row per user per week, written once and reused all week.
-- Run once in the Supabase SQL editor. Safe to run again.

do $$
declare uid_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into uid_type
  from pg_attribute a
  where a.attrelid = 'public.users'::regclass and a.attname = 'id';

  execute format($f$
    create table if not exists public.weekly_reviews (
      user_id %s not null references public.users(id) on delete cascade,
      week_start date not null, -- Monday of the reviewed week, in the user's timezone
      stats jsonb not null,
      summary text,
      created_at timestamptz not null default now(),
      primary key (user_id, week_start)
    )
  $f$, uid_type);
end $$;

alter table public.weekly_reviews enable row level security;
