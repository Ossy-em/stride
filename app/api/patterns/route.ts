import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { FocusFingerprintData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: true });

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length < 3) {
      return NextResponse.json({
        insufficient_data: true,
        sessions_completed: sessions?.length || 0,
        sessions_needed: 5,
      });
    }

    // Fetch interventions for drift pattern analysis
    // FIX: Added 'interventions' table name that was missing
    const sessionIds = sessions.map(s => s.id);
    
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true });

    if (interventionsError) {
      console.error('Failed to fetch interventions:', interventionsError);
      // Don't throw - continue without interventions data
    }

    // PEAK HOURS ANALYSIS
    const peakHours = calculatePeakHours(sessions);

    // DRIFT PATTERN ANALYSIS
    const driftPattern = calculateDriftPattern(interventions || []);

    // DISCOVERIES
    const discoveries = generateDiscoveries(sessions, interventions || []);

    // GROWTH ANALYSIS
    const growth = calculateGrowth(sessions);

    // DAY BREAKDOWN
    const dayBreakdown = calculateDayBreakdown(sessions);

    // HOUR BREAKDOWN
    const hourBreakdown = calculateHourBreakdown(sessions);

    const fingerprintData: FocusFingerprintData = {
      peakHours,
      driftPattern,
      discoveries,
      growth,
      dayBreakdown,
      hourBreakdown,
    };

    return NextResponse.json(fingerprintData);
  } catch (error) {
    console.error('Error fetching focus fingerprint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch focus fingerprint data' },
      { status: 500 }
    );
  }
}


// ============================================
// HELPER FUNCTIONS
// ============================================

function calculatePeakHours(sessions: any[]): FocusFingerprintData['peakHours'] {
  if (sessions.length < 5) return null;

  const hourlyStats: { [hour: number]: { total: number; count: number } } = {};

  sessions.forEach((s) => {
    const hour = new Date(s.started_at).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, count: 0 };
    }
    hourlyStats[hour].total += s.focus_quality;
    hourlyStats[hour].count++;
  });

  // Find best 2-hour window
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

  // Calculate improvement vs overall average
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

function calculateDriftPattern(interventions: any[]): FocusFingerprintData['driftPattern'] {
  if (interventions.length < 3) return null;

  // Map checkpoint to typical minute marks
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

  // Use user_action field (accepted/dismissed/ignored) instead of 'accepted' boolean
  const acceptedCount = interventions.filter((i) => i.user_action === 'accepted').length;
  const successRate = Math.round((acceptedCount / interventions.length) * 100);

  return {
    typicalMinute: avgMinute,
    interventionSuccess: successRate,
  };
}

function generateDiscoveries(
  sessions: any[],
  interventions: any[]
): FocusFingerprintData['discoveries'] {
  const discoveries: FocusFingerprintData['discoveries'] = [];

  if (sessions.length < 5) return discoveries;

  // 1. Best day discovery
  const dayStats = calculateDayBreakdown(sessions);
  const bestDay = dayStats.reduce((best, day) =>
    day.avgScore > best.avgScore ? day : best
  );
  const worstDay = dayStats.reduce((worst, day) =>
    day.avgScore < worst.avgScore && day.sessionCount > 0 ? day : worst
  );

  if (bestDay.sessionCount >= 2) {
    discoveries.push({
      type: 'positive',
      insight: `${bestDay.day}s are your best focus day (${bestDay.avgScore}/100 avg).`,
    });
  }

  if (worstDay.sessionCount >= 2 && worstDay.day !== bestDay.day) {
    discoveries.push({
      type: 'neutral',
      insight: `${worstDay.day}s tend to be harder for you — but you're improving.`,
    });
  }

  // 2. Session length insight
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
        insight: 'You focus better in shorter bursts (under 20 min).',
      });
    } else if (longAvg > shortAvg + 1) {
      discoveries.push({
        type: 'positive',
        insight: 'You hit your stride in longer sessions (30+ min).',
      });
    }
  }

  // 3. Intervention effectiveness
  // FIX: Use user_action field instead of 'accepted' boolean
  if (interventions.length >= 5) {
    const acceptedInterventions = interventions.filter((i) => i.user_action === 'accepted');
    const acceptRate = (acceptedInterventions.length / interventions.length) * 100;

    if (acceptRate >= 70) {
      discoveries.push({
        type: 'positive',
        insight: `You respond well to focus nudges (${Math.round(acceptRate)}% acceptance).`,
      });
    } else if (acceptRate <= 30) {
      discoveries.push({
        type: 'neutral',
        insight: 'You prefer pushing through without breaks — independent focus style.',
      });
    }
  }

  // 4. Morning vs afternoon
  const morningSessions = sessions.filter((s) => {
    const hour = new Date(s.started_at).getHours();
    return hour >= 6 && hour < 12;
  });
  const afternoonSessions = sessions.filter((s) => {
    const hour = new Date(s.started_at).getHours();
    return hour >= 12 && hour < 18;
  });

  if (morningSessions.length >= 3 && afternoonSessions.length >= 3) {
    const morningAvg =
      morningSessions.reduce((sum, s) => sum + s.focus_quality, 0) / morningSessions.length;
    const afternoonAvg =
      afternoonSessions.reduce((sum, s) => sum + s.focus_quality, 0) / afternoonSessions.length;

    if (morningAvg > afternoonAvg + 1) {
      discoveries.push({
        type: 'positive',
        insight: 'You\'re a morning focuser — schedule important work before noon.',
      });
    } else if (afternoonAvg > morningAvg + 1) {
      discoveries.push({
        type: 'positive',
        insight: 'Your focus peaks in the afternoon — lean into it.',
      });
    }
  }

  // 5. Recent improvement
  const recentSessions = sessions.slice(-10);
  const olderSessions = sessions.slice(0, Math.min(10, sessions.length - 10));

  if (olderSessions.length >= 5 && recentSessions.length >= 5) {
    const recentAvg =
      recentSessions.reduce((sum, s) => sum + s.focus_quality, 0) / recentSessions.length;
    const olderAvg =
      olderSessions.reduce((sum, s) => sum + s.focus_quality, 0) / olderSessions.length;

    if (recentAvg > olderAvg + 0.5) {
      discoveries.push({
        type: 'positive',
        insight: 'Your focus is trending up — recent sessions are stronger.',
      });
    }
  }

  return discoveries.slice(0, 5); // Max 5 discoveries
}

function calculateGrowth(sessions: any[]): FocusFingerprintData['growth'] {
  if (sessions.length < 10) return null;

  const firstWeekSessions = sessions.slice(0, Math.min(7, Math.floor(sessions.length / 2)));
  const recentSessions = sessions.slice(-7);

  const firstWeekAvg =
    firstWeekSessions.reduce((sum, s) => sum + s.focus_quality, 0) / firstWeekSessions.length;
  const recentAvg =
    recentSessions.reduce((sum, s) => sum + s.focus_quality, 0) / recentSessions.length;

  // Distraction count comparison (if tracked)
  const firstWeekDrifts =
    firstWeekSessions.reduce((sum, s) => sum + (s.distraction_count || 0), 0) /
    firstWeekSessions.length;
  const recentDrifts =
    recentSessions.reduce((sum, s) => sum + (s.distraction_count || 0), 0) /
    recentSessions.length;

  const improvement =
    firstWeekAvg > 0
      ? Math.round(((recentAvg - firstWeekAvg) / firstWeekAvg) * 100)
      : 0;

  return {
    firstWeekAvg: Math.round(firstWeekAvg * 10),
    recentAvg: Math.round(recentAvg * 10),
    firstWeekDrifts: Math.round(firstWeekDrifts * 10) / 10,
    recentDrifts: Math.round(recentDrifts * 10) / 10,
    improvement,
  };
}

function calculateDayBreakdown(sessions: any[]): FocusFingerprintData['dayBreakdown'] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: { [day: number]: { total: number; count: number } } = {};

  sessions.forEach((s) => {
    const day = new Date(s.started_at).getDay();
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
    const hour = new Date(s.started_at).getHours();
    if (!hourStats[hour]) {
      hourStats[hour] = { total: 0, count: 0 };
    }
    hourStats[hour].total += s.focus_quality;
    hourStats[hour].count++;
  });

  // Return hours 6am to 11pm
  return Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => ({
    hour,
    avgScore: hourStats[hour]
      ? Math.round((hourStats[hour].total / hourStats[hour].count) * 10)
      : 0,
    sessionCount: hourStats[hour]?.count || 0,
  }));
}