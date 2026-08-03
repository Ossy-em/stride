import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { generateDashboardInsights } from '../../../lib/ai-service';
import { evaluateInsightQuality } from '../../../lib/evaluators';
import { logEvaluation } from '../../../lib/opik';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Get the current hour in the user's timezone.
 * Falls back to UTC if no timezone provided.
 */
function getHourInTimezone(timezone?: string): number {
  const now = new Date();
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });
      return parseInt(formatter.format(now));
    } catch (e) {
      // Invalid timezone, fall through to UTC
    }
  }
  return now.getUTCHours();
}

/**
 * Get the start of a day (midnight) in the user's timezone, returned as UTC Date.
 * daysAgo: 0 = today, 1 = yesterday, 7 = a week ago, etc.
 */
function getStartOfDayInTimezone(daysAgo: number, timezone?: string): Date {
  const now = new Date();

  if (timezone) {
    try {
      // Get today's date in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const dateStr = formatter.format(now); // "2026-02-17"
      const [year, month, day] = dateStr.split('-').map(Number);

      // Create the target date (today minus daysAgo)
      const targetDate = new Date(Date.UTC(year, month - 1, day));
      targetDate.setUTCDate(targetDate.getUTCDate() - daysAgo);

      // We need to find what UTC time = midnight of targetDate in the user's timezone.
      // Strategy: start at UTC midnight of that date, check what local time that is,
      // then adjust.
      const guessUTC = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
      ));

      const localParts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(guessUTC);

      const localHour = parseInt(localParts.find(p => p.type === 'hour')?.value || '0');
      const localMinute = parseInt(localParts.find(p => p.type === 'minute')?.value || '0');
      const localDay = parseInt(localParts.find(p => p.type === 'day')?.value || '0');
      const targetDay = targetDate.getUTCDate();

      // Calculate offset: at UTC midnight, local time is localHour:localMinute
      let offsetMinutes: number;

      if (localDay === targetDay) {
        // Same day means timezone is ahead of UTC (positive offset)
        // e.g., UTC midnight = local 5:30 AM means UTC+5:30
        // Local midnight = UTC - 5:30 = previous day 18:30 UTC
        offsetMinutes = localHour * 60 + localMinute;
      } else if (localDay < targetDay || (targetDay === 1 && localDay >= 28)) {
        // Previous day means timezone is behind UTC (negative offset)
        // e.g., UTC midnight = local 7:00 PM previous day means UTC-5
        // Local midnight = UTC + 5:00
        offsetMinutes = -((24 - localHour) * 60 - localMinute);
      } else {
        // Next day means timezone is way ahead
        offsetMinutes = (localHour + 24) * 60 + localMinute;
      }

      // Local midnight in UTC = UTC midnight - offset
      return new Date(guessUTC.getTime() - offsetMinutes * 60 * 1000);
    } catch (e) {
      console.error('Timezone error, falling back to UTC:', e);
    }
  }

  // Fallback: UTC
  const result = new Date(now);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCDate(result.getUTCDate() - daysAgo);
  return result;
}

/**
 * Get a date string (YYYY-M-D) for a given Date in the user's timezone.
 * Used for streak calculation.
 */
function getDateStringInTimezone(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(date);

      const year = parts.find(p => p.type === 'year')?.value;
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
      const day = parts.find(p => p.type === 'day')?.value;
      return `${year}-${month}-${day}`;
    } catch (e) {
      // Fall through
    }
  }
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // *** Get timezone from query param ***
    const timezone = request.nextUrl.searchParams.get('tz') || undefined;

    // TIME BOUNDARIES (now timezone-aware)
    const todayStart = getStartOfDayInTimezone(0, timezone);
    const yesterdayStart = getStartOfDayInTimezone(1, timezone);
    const weekStart = getStartOfDayInTimezone(7, timezone);
    const twoWeeksStart = getStartOfDayInTimezone(14, timezone);

    // FETCH ALL RELEVANT SESSIONS
    const { data: allSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    const sessions = allSessions || [];

    // BASIC STATS (using timezone-aware boundaries)
    const todaySessions = sessions.filter(
      (s) => new Date(s.started_at) >= todayStart && s.focus_quality !== null
    );

    const yesterdaySessions = sessions.filter(
      (s) =>
        new Date(s.started_at) >= yesterdayStart &&
        new Date(s.started_at) < todayStart &&
        s.focus_quality !== null
    );

    const thisWeekSessions = sessions.filter(
      (s) => new Date(s.started_at) >= weekStart && s.focus_quality !== null
    );

    const lastWeekSessions = sessions.filter(
      (s) =>
        new Date(s.started_at) >= twoWeeksStart &&
        new Date(s.started_at) < weekStart &&
        s.focus_quality !== null
    );

    // STREAK CALCULATION (timezone-aware)
    const streak = calculateStreak(sessions, timezone);

    // TOTAL STATS
    const totalSessions = sessions.filter((s) => s.focus_quality !== null).length;
    const totalFocusMinutes = sessions.reduce(
      (sum, s) => sum + (s.actual_duration || 0),
      0
    );

    // TODAY'S SCORE
    const todayScore =
      todaySessions.length > 0
        ? Math.round(
            (todaySessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) /
              todaySessions.length) *
              10
          )
        : null;

    const todayFocusMinutes = todaySessions.reduce(
      (sum, s) => sum + (s.actual_duration || 0),
      0
    );

    // YESTERDAY'S STATS
    const yesterdayScore =
      yesterdaySessions.length > 0
        ? Math.round(
            (yesterdaySessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) /
              yesterdaySessions.length) *
              10
          )
        : null;

    const yesterdayFocusMinutes = yesterdaySessions.reduce(
      (sum, s) => sum + (s.actual_duration || 0),
      0
    );

    // WEEKLY COMPARISON
    const thisWeekAvg =
      thisWeekSessions.length > 0
        ? thisWeekSessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) /
          thisWeekSessions.length
        : 0;

    const lastWeekAvg =
      lastWeekSessions.length > 0
        ? lastWeekSessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) /
          lastWeekSessions.length
        : 0;

    const weeklyTrend =
      lastWeekAvg > 0 ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100) : 0;

    // PEAK HOURS ANALYSIS (timezone-aware)
    const peakHours = calculatePeakHours(sessions, timezone);

    // BEST DAY OF WEEK (timezone-aware)
    const bestDay = calculateBestDay(sessions, timezone);

    // AVERAGE SESSION LENGTH
    const completedSessions = sessions.filter((s) => s.actual_duration);
    const avgSessionMinutes =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + s.actual_duration, 0) /
              completedSessions.length
          )
        : 25;

    // SUGGESTED SESSION LENGTH
    const suggestedDuration = calculateSuggestedDuration(sessions);

    // PERSONAL BEST
    const longestSession = Math.max(
      ...sessions.map((s) => s.actual_duration || 0),
      0
    );
    const highestFocusScore = Math.max(
      ...sessions.map((s) => s.focus_quality || 0),
      0
    );

    // GREETING CONTEXT (timezone-aware hour)
    const userHour = getHourInTimezone(timezone);

    const greetingContext = generateGreetingContext({
      hour: userHour,
      todaySessions,
      yesterdaySessions,
      thisWeekSessions,
      streak,
      peakHours,
      totalSessions,
    });

    // AI INSIGHTS
    const recentSessions = sessions.slice(0, 20).filter((s) => s.focus_quality !== null);

    const insights =
      recentSessions.length >= 3
        ? await generateDashboardInsights(recentSessions, user.id)
        : [];

    if (recentSessions.length >= 3 && insights.length > 0) {
      const qualityScore = await evaluateInsightQuality(insights, recentSessions);
      await logEvaluation({
        name: 'insight_quality',
        traceId: `dashboard_${Date.now()}`,
        score: qualityScore / 10,
        metadata: {
          userId: user.id,
          sessionCount: recentSessions.length,
          insightCount: insights.length,
          rawScore: qualityScore,
        },
      });
    }

    // RESPONSE
    return NextResponse.json({
      user: {
        firstName: user.name?.split(' ')[0] || null,
      },
      greeting: greetingContext,
      today: {
        score: todayScore,
        sessions: todaySessions.length,
        focusMinutes: todayFocusMinutes,
      },
      yesterday: {
        score: yesterdayScore,
        sessions: yesterdaySessions.length,
        focusMinutes: yesterdayFocusMinutes,
      },
      streak: {
        current: streak.current,
        longest: streak.longest,
        isAtRisk: streak.isAtRisk,
      },
      week: {
        sessions: thisWeekSessions.length,
        avgScore: Math.round(thisWeekAvg * 10),
        trend: weeklyTrend,
        focusMinutes: thisWeekSessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0),
      },
      patterns: {
        peakHours,
        bestDay,
        avgSessionMinutes,
        suggestedDuration,
      },
      records: {
        longestSession,
        highestFocusScore,
        totalSessions,
        totalFocusMinutes,
      },
      insights,
      isNewUser: totalSessions < 3,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// HELPER FUNCTIONS

function calculateStreak(
  sessions: any[],
  timezone?: string
): {
  current: number;
  longest: number;
  isAtRisk: boolean;
} {
  if (sessions.length === 0) {
    return { current: 0, longest: 0, isAtRisk: false };
  }

  // Get unique dates with sessions, using user's timezone
  const sessionDates = new Set(
    sessions
      .filter((s) => s.focus_quality !== null)
      .map((s) => getDateStringInTimezone(new Date(s.started_at), timezone))
  );

  const sortedDates = Array.from(sessionDates).sort().reverse();

  // Check if there's a session today (in user's timezone)
  const todayStr = getDateStringInTimezone(new Date(), timezone);
  const hasSessionToday = sessionDates.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date();

  // If no session today, start checking from yesterday
  if (!hasSessionToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = getDateStringInTimezone(checkDate, timezone);
    if (sessionDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  sortedDates.reverse().forEach((dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const currentDate = new Date(year, month, day);

    if (prevDate) {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = currentDate;
  });
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    isAtRisk: !hasSessionToday && currentStreak > 0,
  };
}

function calculatePeakHours(
  sessions: any[],
  timezone?: string
): {
  start: number;
  end: number;
  improvement: number;
} | null {
  const validSessions = sessions.filter((s) => s.focus_quality !== null);
  if (validSessions.length < 5) return null;

  const hourlyStats: { [hour: number]: { total: number; count: number } } = {};

  validSessions.forEach((s) => {
    // Get the hour in the user's timezone
    let hour: number;
    if (timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        });
        hour = parseInt(formatter.format(new Date(s.started_at)));
      } catch {
        hour = new Date(s.started_at).getUTCHours();
      }
    } else {
      hour = new Date(s.started_at).getUTCHours();
    }

    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, count: 0 };
    }
    hourlyStats[hour].total += s.focus_quality;
    hourlyStats[hour].count++;
  });

  let bestWindow = { start: 9, end: 11, avg: 0 };

  for (let start = 6; start <= 20; start++) {
    const hours = [start, start + 1];
    let total = 0;
    let count = 0;

    hours.forEach((h) => {
      if (hourlyStats[h]) {
        total += hourlyStats[h].total;
        count += hourlyStats[h].count;
      }
    });

    const avg = count > 0 ? total / count : 0;
    if (avg > bestWindow.avg) {
      bestWindow = { start, end: start + 2, avg };
    }
  }

  const overallAvg =
    validSessions.reduce((sum, s) => sum + s.focus_quality, 0) / validSessions.length;

  const improvement =
    overallAvg > 0
      ? Math.round(((bestWindow.avg - overallAvg) / overallAvg) * 100)
      : 0;

  return {
    start: bestWindow.start,
    end: bestWindow.end,
    improvement: Math.max(0, improvement),
  };
}

function calculateBestDay(
  sessions: any[],
  timezone?: string
): {
  day: string;
  avgScore: number;
} | null {
  const validSessions = sessions.filter((s) => s.focus_quality !== null);
  if (validSessions.length < 7) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: { [day: number]: { total: number; count: number } } = {};

  validSessions.forEach((s) => {
    // Get the day in the user's timezone
    let day: number;
    if (timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          weekday: 'short',
        });
        const weekday = formatter.format(new Date(s.started_at));
        const dayMap: Record<string, number> = {
          Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
        };
        day = dayMap[weekday] ?? new Date(s.started_at).getUTCDay();
      } catch {
        day = new Date(s.started_at).getUTCDay();
      }
    } else {
      day = new Date(s.started_at).getUTCDay();
    }

    if (!dayStats[day]) {
      dayStats[day] = { total: 0, count: 0 };
    }
    dayStats[day].total += s.focus_quality;
    dayStats[day].count++;
  });

  let bestDay = { day: 0, avg: 0 };

  Object.entries(dayStats).forEach(([day, stats]) => {
    const avg = stats.count > 0 ? stats.total / stats.count : 0;
    if (avg > bestDay.avg) {
      bestDay = { day: parseInt(day), avg };
    }
  });

  return {
    day: dayNames[bestDay.day],
    avgScore: Math.round(bestDay.avg * 10),
  };
}

function calculateSuggestedDuration(sessions: any[]): number {
  const validSessions = sessions.filter(
    (s) => s.focus_quality !== null && s.actual_duration
  );

  if (validSessions.length < 5) return 25;

  const buckets: { [key: string]: { scores: number[]; durations: number[] } } = {
    short: { scores: [], durations: [] },
    medium: { scores: [], durations: [] },
    long: { scores: [], durations: [] },
  };

  validSessions.forEach((s) => {
    const duration = s.actual_duration;
    if (duration < 20) {
      buckets.short.scores.push(s.focus_quality);
      buckets.short.durations.push(duration);
    } else if (duration <= 35) {
      buckets.medium.scores.push(s.focus_quality);
      buckets.medium.durations.push(duration);
    } else {
      buckets.long.scores.push(s.focus_quality);
      buckets.long.durations.push(duration);
    }
  });

  let bestBucket = 'medium';
  let bestAvg = 0;

  Object.entries(buckets).forEach(([name, data]) => {
    if (data.scores.length >= 2) {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestBucket = name;
      }
    }
  });

  switch (bestBucket) {
    case 'short':
      return 15;
    case 'medium':
      return 25;
    case 'long':
      return 45;
    default:
      return 25;
  }
}

function generateGreetingContext(data: {
  hour: number;
  todaySessions: any[];
  yesterdaySessions: any[];
  thisWeekSessions: any[];
  streak: { current: number; longest: number; isAtRisk: boolean };
  peakHours: { start: number; end: number; improvement: number } | null;
  totalSessions: number;
}): {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  message: string;
  subMessage: string | null;
} {
  const { hour, todaySessions, yesterdaySessions, streak, peakHours, totalSessions } = data;

  // Time of day (now using the user's local hour)
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  let message: string;
  let subMessage: string | null = null;

  // New user
  if (totalSessions === 0) {
    message = "Welcome to Stride. Let's try your first focus session.";
    subMessage = "No pressure - just see what happens.";
    return { timeOfDay, message, subMessage };
  }

  // Has sessions today
  if (todaySessions.length > 0) {
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
    message = `You've focused for ${todayMinutes} minutes today.`;

    if (todaySessions.length === 1) {
      subMessage = "One down. Ready for another?";
    } else {
      subMessage = `${todaySessions.length} sessions so far. You're on a roll.`;
    }
    return { timeOfDay, message, subMessage };
  }

  // No sessions today, but had sessions yesterday
  if (yesterdaySessions.length > 0) {
    const yesterdayMinutes = yesterdaySessions.reduce(
      (sum, s) => sum + (s.actual_duration || 0),
      0
    );
    message = `Yesterday you focused for ${yesterdayMinutes} minutes.`;

    if (peakHours && hour >= peakHours.start && hour < peakHours.end) {
      subMessage = `It's your peak focus time right now.`;
    } else if (streak.isAtRisk) {
      subMessage = `Don't break your ${streak.current}-day streak!`;
    } else {
      subMessage = "Ready to start today's first session?";
    }
    return { timeOfDay, message, subMessage };
  }

  // No recent sessions
  message = "It's been a while. Let's ease back in.";
  subMessage = "Start with a short session - 15 minutes?";
  return { timeOfDay, message, subMessage };
}