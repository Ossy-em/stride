import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateDashboardInsights } from '@/lib/ai-service';
import { evaluateInsightQuality } from '@/lib/evaluators';
import { logEvaluation } from '@/lib/opik';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // TIME BOUNDARIES
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const twoWeeksStart = new Date(todayStart);
    twoWeeksStart.setDate(twoWeeksStart.getDate() - 14);
    // FETCH ALL RELEVANT SESSIONS
    const { data: allSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    const sessions = allSessions || [];

    // ============================================
    // BASIC STATS
    // ============================================
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
    // STREAK CALCULATION
    const streak = calculateStreak(sessions);
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
        : null; // null = no sessions today yet

    const todayFocusMinutes = todaySessions.reduce(
      (sum, s) => sum + (s.actual_duration || 0),
      0
    );
    // YESTERDAY'S STATS (for comparison)
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
    // PEAK HOURS ANALYSIS
    const peakHours = calculatePeakHours(sessions);
    // BEST DAY OF WEEK
    const bestDay = calculateBestDay(sessions);
    // AVERAGE SESSION LENGTH
    const completedSessions = sessions.filter((s) => s.actual_duration);
    const avgSessionMinutes =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + s.actual_duration, 0) /
              completedSessions.length
          )
        : 25; // default suggestion
    // SUGGESTED SESSION LENGTH
    // Based on their most successful session lengths
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

    // ============================================
    // GREETING CONTEXT
    // ============================================
    const greetingContext = generateGreetingContext({
      hour: now.getHours(),
      todaySessions,
      yesterdaySessions,
      thisWeekSessions,
      streak,
      peakHours,
      totalSessions,
    });

    // ============================================
    // AI INSIGHTS (existing logic)
    // ============================================
    const recentSessions = sessions.slice(0, 20).filter((s) => s.focus_quality !== null);

    const insights =
      recentSessions.length >= 3
        ? await generateDashboardInsights(recentSessions, user.id)
        : [];

    // Log evaluation if we have enough data
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

    // ============================================
    // RESPONSE
    // ============================================
    return NextResponse.json({
      // User info
      user: {
        firstName: user.name?.split(' ')[0] || null,
      },

      // Greeting & context
      greeting: greetingContext,

      // Today
      today: {
        score: todayScore,
        sessions: todaySessions.length,
        focusMinutes: todayFocusMinutes,
      },

      // Yesterday (for comparison copy)
      yesterday: {
        score: yesterdayScore,
        sessions: yesterdaySessions.length,
        focusMinutes: yesterdayFocusMinutes,
      },

      // Streak
      streak: {
        current: streak.current,
        longest: streak.longest,
        isAtRisk: streak.isAtRisk, // No session today yet
      },

      // Weekly
      week: {
        sessions: thisWeekSessions.length,
        avgScore: Math.round(thisWeekAvg * 10),
        trend: weeklyTrend,
        focusMinutes: thisWeekSessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0),
      },

      // Patterns (for Focus Fingerprint teaser)
      patterns: {
        peakHours,
        bestDay,
        avgSessionMinutes,
        suggestedDuration,
      },

      // Personal bests
      records: {
        longestSession,
        highestFocusScore,
        totalSessions,
        totalFocusMinutes,
      },

      // AI Insights
      insights,

      // Is this a new user?
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

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateStreak(sessions: any[]): {
  current: number;
  longest: number;
  isAtRisk: boolean;
} {
  if (sessions.length === 0) {
    return { current: 0, longest: 0, isAtRisk: false };
  }

  // Get unique dates with sessions
  const sessionDates = new Set(
    sessions
      .filter((s) => s.focus_quality !== null)
      .map((s) => {
        const d = new Date(s.started_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );

  const sortedDates = Array.from(sessionDates).sort().reverse();

  // Check if there's a session today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const hasSessionToday = sessionDates.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date();

  // If no session today, start checking from yesterday
  if (!hasSessionToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
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

function calculatePeakHours(sessions: any[]): {
  start: number;
  end: number;
  improvement: number;
} | null {
  const validSessions = sessions.filter((s) => s.focus_quality !== null);
  if (validSessions.length < 5) return null;

  // Group by hour
  const hourlyStats: { [hour: number]: { total: number; count: number } } = {};

  validSessions.forEach((s) => {
    const hour = new Date(s.started_at).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, count: 0 };
    }
    hourlyStats[hour].total += s.focus_quality;
    hourlyStats[hour].count++;
  });

  // Find best 2-hour window
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

  // Calculate overall average for comparison
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

function calculateBestDay(sessions: any[]): {
  day: string;
  avgScore: number;
} | null {
  const validSessions = sessions.filter((s) => s.focus_quality !== null);
  if (validSessions.length < 7) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: { [day: number]: { total: number; count: number } } = {};

  validSessions.forEach((s) => {
    const day = new Date(s.started_at).getDay();
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
  // Find the duration range where users have highest focus scores
  const validSessions = sessions.filter(
    (s) => s.focus_quality !== null && s.actual_duration
  );

  if (validSessions.length < 5) return 25; // Default

  // Group into duration buckets
  const buckets: { [key: string]: { scores: number[]; durations: number[] } } = {
    short: { scores: [], durations: [] }, // < 20 min
    medium: { scores: [], durations: [] }, // 20-35 min
    long: { scores: [], durations: [] }, // > 35 min
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

  // Find bucket with highest average score (min 2 sessions)
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

  // Return suggested duration based on best bucket
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

  // Time of day
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // Generate contextual message
  let message: string;
  let subMessage: string | null = null;

  // New user
  if (totalSessions === 0) {
    message = "Welcome to Stride. Let's try your first focus session.";
    subMessage = "No pressure — just see what happens.";
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

    // Check if in peak hours
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
  subMessage = "Start with a short session — 15 minutes?";
  return { timeOfDay, message, subMessage };
}