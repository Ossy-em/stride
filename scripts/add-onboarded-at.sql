-- Stride: remember onboarding on the account instead of the browser.
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. When the user finished (or skipped) the intro. NULL = not yet.
alter table public.users
  add column if not exists onboarded_at timestamptz;

-- 2. Everyone who already has an account has been through the old
--    browser-based intro, so don't show it to them again.
update public.users
  set onboarded_at = coalesce(created_at, now())
  where onboarded_at is null;
