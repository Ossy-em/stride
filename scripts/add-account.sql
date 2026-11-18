-- Account: profile preferences, email sign-in links, and which sign-in methods each user has used.
-- Run once in the Supabase SQL editor. Safe to run again.

-- defaults for starting a session (null = use Stride's suggestion)
alter table public.users add column if not exists default_duration integer
  check (default_duration is null or default_duration between 3 and 180);
alter table public.users add column if not exists default_task_type text
  check (default_task_type is null or default_task_type in ('coding', 'writing', 'reading'));

-- one-time sign-in links sent by email (only a hash of the token is stored)
create table if not exists public.login_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists login_tokens_email_idx on public.login_tokens (email, created_at desc);
alter table public.login_tokens enable row level security;

-- sign-in methods per user (google, apple, github, email), for Settings
do $$
declare uid_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into uid_type
  from pg_attribute a where a.attrelid = 'public.users'::regclass and a.attname = 'id';
  execute format($f$
    create table if not exists public.user_identities (
      user_id %s not null references public.users(id) on delete cascade,
      provider text not null,
      email text,
      first_used_at timestamptz not null default now(),
      last_used_at timestamptz not null default now(),
      primary key (user_id, provider)
    )$f$, uid_type);
end $$;
alter table public.user_identities enable row level security;
