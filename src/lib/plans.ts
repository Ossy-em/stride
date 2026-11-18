import { supabaseAdmin } from './supabase';

import { PLAN_LIMITS, getLimitsByPlan, type PlanLimits, type UserPlan } from './plan-limits';

export type { PlanLimits, UserPlan };
export { PLAN_LIMITS, getLimitsByPlan };

const GRACE_MS = 3 * 24 * 60 * 60 * 1000; // a renewal that's this late without a webhook = lapsed

type BillingRow = {
  plan?: string | null;
  ls_subscription_id?: string | null;
  ls_status?: string | null;
  ls_renews_at?: string | null;
  ls_ends_at?: string | null;
};

/**
 * The plan someone should actually have right now. The webhook normally
 * flips premium back to free, but if Lemon Squeezy's expiry event never
 * lands, the dates on the subscription still end premium on time.
 * Premium given by hand (no subscription id) is left alone.
 */
export function effectivePlan(u: BillingRow | null | undefined, now = Date.now()): UserPlan {
  if (u?.plan !== 'premium') return 'free';
  if (!u.ls_subscription_id) return 'premium';
  const status = u.ls_status || '';
  if (['expired', 'unpaid', 'paused'].includes(status)) return 'free';
  const at = (s?: string | null) => (s ? Date.parse(s) : NaN);
  if (status === 'cancelled') {
    const ends = at(u.ls_ends_at ?? u.ls_renews_at);
    if (!Number.isNaN(ends) && ends <= now) return 'free';
    return 'premium';
  }
  const renews = at(u.ls_renews_at);
  if (!Number.isNaN(renews) && renews + GRACE_MS <= now) return 'free';
  return 'premium';
}

// Get user's plan (expiry-checked; a lapsed premium row is moved back to free)
export async function getUserPlan(userId: string): Promise<UserPlan> {
  let res = await supabaseAdmin
    .from('users')
    .select('plan, ls_subscription_id, ls_status, ls_renews_at, ls_ends_at')
    .eq('id', userId)
    .single();
  // before add-billing-expiry.sql runs, ls_ends_at doesn't exist yet
  if (res.error && /ls_ends_at/.test(res.error.message || '')) {
    res = (await supabaseAdmin
      .from('users')
      .select('plan, ls_subscription_id, ls_status, ls_renews_at')
      .eq('id', userId)
      .single()) as typeof res;
  }
  const row = res.data as BillingRow | null;
  const plan = effectivePlan(row);
  if (row?.plan === 'premium' && plan === 'free') {
    await supabaseAdmin
      .from('users')
      .update({ plan: 'free', plan_updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('plan', 'premium');
    console.log(`⬇️ User ${userId} moved to free: subscription lapsed (${row.ls_status})`);
  }
  return plan;
}

// Get plan limits for a user
export async function getPlanLimits(userId: string): Promise<PlanLimits> {
  const plan = await getUserPlan(userId);
  return PLAN_LIMITS[plan];
}

/**
 * Get the start of "today" in the user's timezone as a UTC ISO string.
 * The client sends their IANA timezone (e.g., "America/New_York").
 * We figure out what date it is for them, then find midnight of that date in UTC.
 * Falls back to UTC if no timezone provided.
 */
export function getStartOfDayInTimezone(timezone?: string): string {
  const now = new Date();

  if (timezone) {
    try {
      // Get the current date parts in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      // en-CA gives us YYYY-MM-DD format
      const dateStr = formatter.format(now); // e.g., "2026-02-17"

      // Now we need to find what UTC time corresponds to midnight of this date
      // in the user's timezone. We can do this by creating dates and checking.
      // 
      // Strategy: Create a UTC date at midnight of that date, then adjust by
      // the timezone offset at that time.
      const [year, month, day] = dateStr.split('-').map(Number);
      
      // Start with a guess: UTC midnight of that date
      const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      // Check what date it is in the user's timezone at our guess time
      // and adjust. The offset tells us how far off we are.
      const localAtGuess = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(guess);

      const guessHour = parseInt(localAtGuess.find(p => p.type === 'hour')?.value || '0');
      const guessMinute = parseInt(localAtGuess.find(p => p.type === 'minute')?.value || '0');
      const guessDay = localAtGuess.find(p => p.type === 'day')?.value;

      // If at UTC midnight, the local time shows e.g., 19:00 of the previous day,
      // that means the timezone is UTC-5, so local midnight = UTC 05:00
      // If at UTC midnight, the local time shows e.g., 05:30 of the same day,
      // that means the timezone is UTC+5:30, so local midnight = UTC previous day 18:30

      // The offset in minutes from UTC: if local is ahead, offset is positive
      let offsetMinutes: number;
      
      if (guessDay === String(day).padStart(2, '0')) {
        // Same day: local is ahead of UTC by guessHour:guessMinute
        offsetMinutes = guessHour * 60 + guessMinute;
      } else if (parseInt(guessDay || '0') > day || (month === 1 && day === 1 && parseInt(guessDay || '0') === 31)) {
        // Next day: local is way ahead
        offsetMinutes = (guessHour + 24) * 60 + guessMinute;
      } else {
        // Previous day: local is behind UTC
        offsetMinutes = -((24 - guessHour) * 60 - guessMinute);
      }

      // Local midnight in UTC = UTC midnight minus the offset
      const midnightUTC = new Date(guess.getTime() - offsetMinutes * 60 * 1000);
      return midnightUTC.toISOString();
    } catch (e) {
      console.error('Timezone parsing error, falling back to UTC:', e);
    }
  }

  // Fallback: UTC midnight
  const utcMidnight = new Date(now);
  utcMidnight.setUTCHours(0, 0, 0, 0);
  return utcMidnight.toISOString();
}

const DAY_MS = 24 * 60 * 60 * 1000;
const validZone = (tz?: string) => {
  try {
    if (tz) {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return tz;
    }
  } catch {}
  return null;
};

/**
 * The timezone daily limits are counted in. Saved on the user so the browser
 * can't reset "today" by sending a different zone each request: it can change
 * at most once every 24 hours (enough for real travel).
 * Before scripts/add-user-timezone.sql is run, falls back to the client's zone.
 */
export async function limitZone(userId: string, clientTz?: string): Promise<string> {
  const asked = validZone(clientTz);
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('timezone, timezone_updated_at')
    .eq('id', userId)
    .single();
  if (error) return asked || 'UTC';

  const saved = validZone(data?.timezone ?? undefined);
  const changedAt = data?.timezone_updated_at ? new Date(data.timezone_updated_at).getTime() : 0;
  if (asked && asked !== saved && (!saved || Date.now() - changedAt >= DAY_MS)) {
    await supabaseAdmin
      .from('users')
      .update({ timezone: asked, timezone_updated_at: new Date().toISOString() })
      .eq('id', userId);
    return asked;
  }
  return saved || asked || 'UTC';
}

// Check if user can start a new session today
// Now accepts optional timezone from the client
export async function canStartSession(userId: string, timezone?: string): Promise<{
  allowed: boolean;
  reason?: string;
  sessionsToday?: number;
  limit?: number;
}> {
  const limits = await getPlanLimits(userId);

  // Premium = unlimited
  if (limits.maxSessionsPerDay === -1) {
    return { allowed: true };
  }

  // Count today's sessions in the user's saved timezone
  const startOfToday = getStartOfDayInTimezone(await limitZone(userId, timezone));

  // Every session started today counts, finished or not. Counting only
  // finished ones let a free user start sessions and never end them.
  const { count, error } = await supabaseAdmin
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('started_at', startOfToday);

  if (error) {
    console.error('Error checking session count:', error);
    return { allowed: true }; // Fail open
  }

  const sessionsToday = count || 0;

  if (sessionsToday >= limits.maxSessionsPerDay) {
    return {
      allowed: false,
      reason: `You've used all ${limits.maxSessionsPerDay} free sessions today. Upgrade to Premium for unlimited sessions.`,
      sessionsToday,
      limit: limits.maxSessionsPerDay,
    };
  }

  return {
    allowed: true,
    sessionsToday,
    limit: limits.maxSessionsPerDay,
  };
}

// Check if requested duration is within plan limits
export function isDurationAllowed(plan: UserPlan, durationMinutes: number): {
  allowed: boolean;
  maxAllowed: number;
  reason?: string;
} {
  const limits = PLAN_LIMITS[plan];

  if (durationMinutes <= limits.maxSessionDuration) {
    return { allowed: true, maxAllowed: limits.maxSessionDuration };
  }

  return {
    allowed: false,
    maxAllowed: limits.maxSessionDuration,
    reason: `Free plan sessions are limited to ${limits.maxSessionDuration} minutes. Upgrade to Premium for sessions up to ${PLAN_LIMITS.premium.maxSessionDuration} minutes.`,
  };
}

// Check feature access
export function isPremiumFeature(plan: UserPlan, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  return typeof value === 'boolean' ? value : true;
}