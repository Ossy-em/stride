-- Billing expiry + daily-limit timezone. Run once in the Supabase SQL editor. Safe to run again.

-- when a cancelled subscription stops (Lemon Squeezy ends_at); premium ends on this date
-- even if the expiry webhook never arrives
alter table public.users add column if not exists ls_ends_at timestamptz;

-- the timezone daily limits are counted in (lib/plans.ts limitZone). Without these,
-- "today" follows whatever timezone the browser sends, so limits can be reset.
alter table public.users add column if not exists timezone text;
alter table public.users add column if not exists timezone_updated_at timestamptz;
