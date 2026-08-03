import { supabaseAdmin } from './supabase';

export type UserPlan = 'free' | 'premium';

export interface PlanLimits {
  maxSessionsPerDay: number;
  maxSessionDuration: number; // minutes
  interventionModel: 'claude-3-haiku-20240307' | 'claude-sonnet-4-20250514';
  interventionTiming: 'fixed' | 'pattern_based';
  hasAIInsights: boolean;
  hasSelfDiscovery: boolean;
  sessionHistoryDays: number; // -1 for unlimited
  canPause: boolean;
  canExport: boolean;
}

const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxSessionsPerDay: 3,
    maxSessionDuration: 30,
    interventionModel: 'claude-3-haiku-20240307',
    interventionTiming: 'fixed',
    hasAIInsights: false,
    hasSelfDiscovery: false,
    sessionHistoryDays: 7,
    canPause: false,
    canExport: false,
  },
  premium: {
    maxSessionsPerDay: -1, // unlimited
    maxSessionDuration: 180,
    interventionModel: 'claude-sonnet-4-20250514',
    interventionTiming: 'pattern_based',
    hasAIInsights: true,
    hasSelfDiscovery: true,
    sessionHistoryDays: -1, // unlimited
    canPause: true,
    canExport: true,
  },
};

// Get user's plan
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  return (data?.plan as UserPlan) || 'free';
}

// Get plan limits for a user
export async function getPlanLimits(userId: string): Promise<PlanLimits> {
  const plan = await getUserPlan(userId);
  return PLAN_LIMITS[plan];
}

// Get limits by plan directly (no DB call)
export function getLimitsByPlan(plan: UserPlan): PlanLimits {
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

  // Count today's sessions using the user's timezone
  const startOfToday = getStartOfDayInTimezone(timezone);

  const { count, error } = await supabaseAdmin
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('started_at', startOfToday)
    .not('ended_at', 'is', null); // Only count completed sessions

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