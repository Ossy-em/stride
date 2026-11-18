/**
 * Focus Fingerprint (Insights) maths, shared by /api/insights and the Agent.
 * Everything is computed from the user's own saved sessions.
 */
import { supabaseAdmin } from './supabase';
import type { FocusFingerprintData } from '@/types';

// Hour of day and weekday in the user's own timezone (?tz=Africa/Lagos).
// Without it the server's clock (UTC in production) shifted peak hours and days.
/** Same threshold Home uses for "Complete N more sessions". */
const SESSIONS_NEEDED = 5;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function withLocalTime<T extends { started_at: string }>(rows: T[], tz: string | null) {
  let fmt: Intl.DateTimeFormat | null = null;
  try {
    if (tz) fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23', weekday: 'short' });
  } catch {
    fmt = null; // unknown zone: fall back to the server clock
  }
  return rows.map((r) => {
    const t = r.started_at;
    const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`);
    if (!fmt) return { ...r, _hour: d.getHours(), _day: d.getDay() };
    const parts = fmt.formatToParts(d);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? d.getHours()) % 24;
    const day = WEEKDAYS.indexOf(parts.find((p) => p.type === 'weekday')?.value ?? '');
    return { ...r, _hour: hour, _day: day < 0 ? d.getDay() : day };
  });
}

export type InsightsResult =
  | FocusFingerprintData
  | { insufficient_data: true; sessions_completed: number; sessions_needed: number };

export async function getInsightsData(userId: string, tz: string | null): Promise<InsightsResult> {
  const { data: rawSessions, error: sessionsError } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .not('focus_quality', 'is', null)
    .order('started_at', { ascending: true });

  if (sessionsError) throw sessionsError;
  const sessions = rawSessions ? withLocalTime(rawSessions, tz) : rawSessions;

  if (!sessions || sessions.length < SESSIONS_NEEDED) {
    return {
      insufficient_data: true,
      sessions_completed: sessions?.length || 0,
      sessions_needed: SESSIONS_NEEDED,
    };
  }

  const sessionIds = sessions.map((s) => s.id);
  const { data: interventions, error: interventionsError } = await supabaseAdmin
    .from('interventions')
    .select('*')
    .in('session_id', sessionIds)
    .order('triggered_at', { ascending: true });
  if (interventionsError) console.error('Failed to fetch interventions:', interventionsError);

  const { data: aiPatterns } = await supabaseAdmin
    .from('patterns')
    .select('pattern_type, insight, confidence')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })
    .limit(10);

  return {
    peakHours: calculatePeakHours(sessions),
    driftPattern: calculateDriftPattern(sessions, interventions || []),
    discoveries: generateDiscoveries(sessions, interventions || [], aiPatterns || []),
    growth: calculateGrowth(sessions),
    dayBreakdown: calculateDayBreakdown(sessions),
    hourBreakdown: calculateHourBreakdown(sessions),
  };
}


// ============================================
// HELPER FUNCTIONS
// ============================================

function calculatePeakHours(sessions: any[]): FocusFingerprintData['peakHours'] {
  if (sessions.length < 5) return null;

  const hourlyStats: { [hour: number]: { total: number; count: number } } = {};

  sessions.forEach((s) => {
    const hour = s._hour;
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, count: 0 };
    }
    hourlyStats[hour].total += s.focus_quality;
    hourlyStats[hour].count++;
  });

  let bestWindow = { start: 9, end: 11, avg: 0, count: 0 };

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
    if (avg > bestWindow.avg && count >= 2) {
      bestWindow = { start, end: start + 2, avg, count };
    }
  }

  const overallAvg =
    sessions.reduce((sum, s) => sum + s.focus_quality, 0) / sessions.length;

  const improvement =
    overallAvg > 0
      ? Math.round(((bestWindow.avg - overallAvg) / overallAvg) * 100)
      : 0;

  return {
    start: bestWindow.start,
    end: bestWindow.end,
    improvement: Math.max(0, improvement),
    sessionCount: bestWindow.count,
  };
}

function calculateDriftPattern(
  sessions: any[],
  interventions: any[]
): FocusFingerprintData['driftPattern'] {
  if (interventions.length < 3) return null;

  const driftMinutes: number[] = [];

  interventions.forEach((intervention) => {
    const session = sessions.find(s => s.id === intervention.session_id);
    if (!session || !session.started_at || !intervention.triggered_at) return;

    const sessionStart = new Date(session.started_at + 'Z').getTime();
    const interventionTime = new Date(intervention.triggered_at).getTime();
    const minutesIn = Math.round((interventionTime - sessionStart) / 60000);

    if (minutesIn > 0 && minutesIn < (session.planned_duration || 120)) {
      driftMinutes.push(minutesIn);
    }
  });

  if (driftMinutes.length === 0) {
    const checkpointMinutes: { [key: string]: number } = {
      'early': 5,
      'mid': 15,
      'late': 25,
    };

    const estimatedMinutes = interventions
      .map((i) => checkpointMinutes[i.checkpoint] || 10)
      .filter(Boolean);

    if (estimatedMinutes.length === 0) return null;

    const avgMinute = Math.round(
      estimatedMinutes.reduce((a, b) => a + b, 0) / estimatedMinutes.length
    );

    const acceptedCount = interventions.filter((i) => i.user_action === 'accepted').length;
    const successRate = Math.round((acceptedCount / interventions.length) * 100);

    return { typicalMinute: avgMinute, interventionSuccess: successRate };
  }

  const avgMinute = Math.round(
    driftMinutes.reduce((a, b) => a + b, 0) / driftMinutes.length
  );

  const acceptedCount = interventions.filter((i) => i.user_action === 'accepted').length;
  const successRate = Math.round((acceptedCount / interventions.length) * 100);

  return {
    typicalMinute: avgMinute,
    interventionSuccess: successRate,
  };
}

function generateDiscoveries(
  sessions: any[],
  interventions: any[],
  aiPatterns: any[]
): FocusFingerprintData['discoveries'] {
  const discoveries: FocusFingerprintData['discoveries'] = [];

  if (sessions.length < 3) return discoveries;

  const dayStats = calculateDayBreakdown(sessions);
  const activeDays = dayStats.filter(d => d.sessionCount > 0);
  const bestDay = activeDays.reduce((best, day) =>
    day.avgScore > best.avgScore ? day : best
  , activeDays[0]);

  if (bestDay && bestDay.sessionCount >= 2) {
    discoveries.push({
      type: 'positive',
      insight: `${bestDay.day}s are your best focus day (${bestDay.avgScore}/100 avg).`,
    });
  }

  const taskStats: { [type: string]: { total: number; count: number } } = {};
  sessions.forEach(s => {
    if (!taskStats[s.task_type]) taskStats[s.task_type] = { total: 0, count: 0 };
    taskStats[s.task_type].total += s.focus_quality;
    taskStats[s.task_type].count++;
  });

  const taskEntries = Object.entries(taskStats).filter(([_, v]) => v.count >= 2);
  if (taskEntries.length >= 2) {
    const sorted = taskEntries.sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count));
    const bestTask = sorted[0];
    const bestTaskAvg = Math.round((bestTask[1].total / bestTask[1].count) * 10);
    const taskLabel = formatTaskType(bestTask[0]);
    discoveries.push({
      type: 'positive',
      insight: `${taskLabel} sessions get your highest focus (${bestTaskAvg}/100 across ${bestTask[1].count} sessions).`,
    });
  }

  const shortSessions = sessions.filter((s) => s.actual_duration && s.actual_duration < 20);
  const longSessions = sessions.filter((s) => s.actual_duration && s.actual_duration >= 30);

  if (shortSessions.length >= 3 && longSessions.length >= 3) {
    const shortAvg =
      shortSessions.reduce((sum, s) => sum + s.focus_quality, 0) / shortSessions.length;
    const longAvg =
      longSessions.reduce((sum, s) => sum + s.focus_quality, 0) / longSessions.length;

    if (shortAvg > longAvg + 1) {
      discoveries.push({
        type: 'positive',
        insight: `Short sessions (under 20 min) score ${Math.round(shortAvg * 10)}/100 vs ${Math.round(longAvg * 10)}/100 for longer ones.`,
      });
    } else if (longAvg > shortAvg + 1) {
      discoveries.push({
        type: 'positive',
        insight: `Longer sessions (30+ min) score ${Math.round(longAvg * 10)}/100 and you build momentum over time.`,
      });
    }
  }

  if (interventions.length >= 5) {
    const acceptedInterventions = interventions.filter((i) => i.user_action === 'accepted');
    const acceptRate = (acceptedInterventions.length / interventions.length) * 100;

    if (acceptRate >= 70) {
      discoveries.push({
        type: 'positive',
        insight: `Focus nudges work well for you: ${Math.round(acceptRate)}% acceptance rate across ${interventions.length} check-ins.`,
      });
    } else if (acceptRate <= 30) {
      discoveries.push({
        type: 'neutral',
        insight: `You prefer pushing through without breaks, an independent focus style (${Math.round(acceptRate)}% nudge acceptance).`,
      });
    }
  }

  const morningSessions = sessions.filter((s) => {
    const hour = s._hour;
    return hour >= 6 && hour < 12;
  });
  const afternoonSessions = sessions.filter((s) => {
    const hour = s._hour;
    return hour >= 12 && hour < 18;
  });

  if (morningSessions.length >= 3 && afternoonSessions.length >= 3) {
    const morningAvg =
      morningSessions.reduce((sum, s) => sum + s.focus_quality, 0) / morningSessions.length;
    const afternoonAvg =
      afternoonSessions.reduce((sum, s) => sum + s.focus_quality, 0) / afternoonSessions.length;
    const diff = Math.round(Math.abs(morningAvg - afternoonAvg) * 10);

    if (morningAvg > afternoonAvg + 0.5 && diff > 5) {
      discoveries.push({
        type: 'positive',
        insight: `Morning sessions average ${diff} points higher. You're a morning focuser.`,
      });
    } else if (afternoonAvg > morningAvg + 0.5 && diff > 5) {
      discoveries.push({
        type: 'positive',
        insight: `Afternoon sessions average ${diff} points higher. Your focus peaks after noon.`,
      });
    }
  }

  const completedOnTime = sessions.filter(s => 
    s.actual_duration && s.planned_duration && 
    s.actual_duration >= s.planned_duration * 0.8
  ).length;
  const completionRate = Math.round((completedOnTime / sessions.length) * 100);

  if (sessions.length >= 5 && completionRate >= 80) {
    discoveries.push({
      type: 'positive',
      insight: `${completionRate}% session completion rate. You finish what you start.`,
    });
  } else if (sessions.length >= 5 && completionRate < 50) {
    discoveries.push({
      type: 'neutral',
      insight: `${completionRate}% of sessions reach planned duration. Try shorter targets to build consistency.`,
    });
  }

  if (aiPatterns && aiPatterns.length > 0) {
    const highConfidence = aiPatterns.filter(p => p.confidence >= 0.6);
    highConfidence.forEach(pattern => {
      const isDuplicate = discoveries.some(d => 
        d.insight.toLowerCase().includes(pattern.insight.toLowerCase().slice(0, 20))
      );
      if (!isDuplicate && discoveries.length < 6) {
        discoveries.push({
          type: 'positive',
          insight: pattern.insight,
        });
      }
    });
  }

  const recentSessions = sessions.slice(-5);
  if (recentSessions.length >= 5) {
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.focus_quality, 0) / recentSessions.length;
    if (recentAvg >= 7) {
      discoveries.push({
        type: 'positive',
        insight: `Last 5 sessions averaged ${Math.round(recentAvg * 10)}/100. You're on a hot streak.`,
      });
    }
  }

  return discoveries.slice(0, 6);
}

function calculateGrowth(sessions: any[]): FocusFingerprintData['growth'] {
  if (sessions.length < 6) return null;

  const halfIdx = Math.floor(sessions.length / 2);
  const firstHalf = sessions.slice(0, halfIdx);
  const recentHalf = sessions.slice(halfIdx);

  const firstAvg =
    firstHalf.reduce((sum, s) => sum + s.focus_quality, 0) / firstHalf.length;
  const recentAvg =
    recentHalf.reduce((sum, s) => sum + s.focus_quality, 0) / recentHalf.length;

  const firstDrifts =
    firstHalf.reduce((sum, s) => sum + (s.distraction_count || 0), 0) / firstHalf.length;
  const recentDrifts =
    recentHalf.reduce((sum, s) => sum + (s.distraction_count || 0), 0) / recentHalf.length;

  const improvement =
    firstAvg > 0
      ? Math.round(((recentAvg - firstAvg) / firstAvg) * 100)
      : 0;

  return {
    firstWeekAvg: Math.round(firstAvg * 10),
    recentAvg: Math.round(recentAvg * 10),
    firstWeekDrifts: Math.round(firstDrifts * 10) / 10,
    recentDrifts: Math.round(recentDrifts * 10) / 10,
    improvement,
  };
}

function calculateDayBreakdown(sessions: any[]): FocusFingerprintData['dayBreakdown'] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: { [day: number]: { total: number; count: number } } = {};

  sessions.forEach((s) => {
    const day = s._day;
    if (!dayStats[day]) {
      dayStats[day] = { total: 0, count: 0 };
    }
    dayStats[day].total += s.focus_quality;
    dayStats[day].count++;
  });

  return dayNames.map((name, index) => ({
    day: name,
    avgScore: dayStats[index]
      ? Math.round((dayStats[index].total / dayStats[index].count) * 10)
      : 0,
    sessionCount: dayStats[index]?.count || 0,
  }));
}

function calculateHourBreakdown(sessions: any[]): FocusFingerprintData['hourBreakdown'] {
  const hourStats: { [hour: number]: { total: number; count: number } } = {};

  sessions.forEach((s) => {
    const hour = s._hour;
    if (!hourStats[hour]) {
      hourStats[hour] = { total: 0, count: 0 };
    }
    hourStats[hour].total += s.focus_quality;
    hourStats[hour].count++;
  });

  return Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => ({
    hour,
    avgScore: hourStats[hour]
      ? Math.round((hourStats[hour].total / hourStats[hour].count) * 10)
      : 0,
    sessionCount: hourStats[hour]?.count || 0,
  }));
}

function formatTaskType(type: string): string {
  const map: Record<string, string> = {
    coding: 'Coding',
    writing: 'Writing',
    reading: 'Reading',
    design: 'Design',
    studying: 'Studying',
  };
  return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
}