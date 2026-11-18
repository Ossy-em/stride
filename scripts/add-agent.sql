-- Agent: chat history, and the count behind the free daily limit.
-- Run once in the Supabase SQL editor. Safe to run again.

do $$
declare uid_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into uid_type
  from pg_attribute a
  where a.attrelid = 'public.users'::regclass and a.attname = 'id';

  execute format($f$
    create table if not exists public.agent_conversations (
      id uuid primary key default gen_random_uuid(),
      user_id %s not null references public.users(id) on delete cascade,
      title text not null default 'New chat',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      deleted_at timestamptz -- chats are hidden, not erased, so deleting one doesn't reset the daily count
    )
  $f$, uid_type);

  execute format($f$
    create table if not exists public.agent_messages (
      id uuid primary key default gen_random_uuid(),
      conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
      user_id %s not null references public.users(id) on delete cascade,
      role text not null check (role in ('user', 'assistant')),
      content text not null,
      created_at timestamptz not null default now()
    )
  $f$, uid_type);
end $$;

create index if not exists agent_conversations_user_idx on public.agent_conversations (user_id, updated_at desc);
create index if not exists agent_messages_conversation_idx on public.agent_messages (conversation_id, created_at);
-- counts today's messages for the free limit
create index if not exists agent_messages_user_day_idx on public.agent_messages (user_id, role, created_at);

alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;
