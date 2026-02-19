import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple password protection
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'stride-admin-2024';

export async function GET(request: NextRequest) {
  try {
    // Check password from header
    const password = request.headers.get('x-admin-password');
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // ============================================
    // USER METRICS
    // ============================================
    
    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // New signups today
    const { count: signupsToday } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // New signups this week
    const { count: signupsWeek } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    // New signups this month
    const { count: signupsMonth } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    // Active users (session in last 7 days)
    const { data: activeSessions } = await supabaseAdmin
      .from('sessions')
      .select('user_id')
      .gte('started_at', weekStart.toISOString());
    
    const activeUsers = new Set(activeSessions?.map(s => s.user_id)).size;

    // User growth over time (last 30 days)
    const { data: userGrowthData } = await supabaseAdmin
      .from('users')
      .select('created_at')
      .gte('created_at', monthStart.toISOString())
      .order('created_at', { ascending: true });

    const userGrowth = aggregateByDay(userGrowthData || [], 'created_at');

    // ============================================
    // ENGAGEMENT METRICS
    // ============================================

    // Total sessions
    const { count: totalSessions } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    // Sessions with focus quality (completed sessions)
    const { data: completedSessions } = await supabaseAdmin
      .from('sessions')
      .select('focus_quality, actual_duration, user_id')
      .not('focus_quality', 'is', null);

    const avgFocusQuality = completedSessions?.length
      ? completedSessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / completedSessions.length
      : 0;

    // Sessions per user
    const sessionsPerUser = totalUsers ? (totalSessions || 0) / totalUsers : 0;

    // Top 10 users by session count
    const userSessionCounts: Record<string, number> = {};
    completedSessions?.forEach(s => {
      userSessionCounts[s.user_id] = (userSessionCounts[s.user_id] || 0) + 1;
    });
    
    const topUsers = Object.entries(userSessionCounts)
      .map(([userId, count]) => ({ userId, sessionCount: count }))
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 10);

    // Session activity by hour (heatmap data)
    const { data: allSessions } = await supabaseAdmin
      .from('sessions')
      .select('started_at')
      .not('started_at', 'is', null);

    const hourlyActivity: Record<number, number> = {};
    allSessions?.forEach(s => {
      const hour = new Date(s.started_at).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // ============================================
    // INTERVENTION METRICS
    // ============================================

    const { count: totalInterventions } = await supabaseAdmin
      .from('interventions')
      .select('*', { count: 'exact', head: true });

    const { data: interventionData } = await supabaseAdmin
      .from('interventions')
      .select('user_action, effective, variant_type, checkpoint');

    const acceptedInterventions = interventionData?.filter(i => i.user_action === 'accepted').length || 0;
    const effectiveInterventions = interventionData?.filter(i => i.effective === true).length || 0;
    const interventionAcceptRate = totalInterventions ? (acceptedInterventions / totalInterventions) * 100 : 0;
    const interventionEffectiveRate = totalInterventions ? (effectiveInterventions / totalInterventions) * 100 : 0;

    // Variant performance
    const variantStats: Record<string, { total: number; accepted: number; effective: number }> = {};
    interventionData?.forEach(i => {
      const variant = i.variant_type || 'unknown';
      if (!variantStats[variant]) {
        variantStats[variant] = { total: 0, accepted: 0, effective: 0 };
      }
      variantStats[variant].total++;
      if (i.user_action === 'accepted') variantStats[variant].accepted++;
      if (i.effective) variantStats[variant].effective++;
    });

    // ============================================
    // WAITLIST METRICS
    // ============================================

    const { count: totalWaitlist } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const { count: waitlistToday } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    const { count: waitlistWeek } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    // ============================================
    // PATTERN METRICS
    // ============================================

    const { count: totalPatterns } = await supabaseAdmin
      .from('patterns')
      .select('*', { count: 'exact', head: true });

    const { data: patternData } = await supabaseAdmin
      .from('patterns')
      .select('pattern_type, confidence');

    const avgPatternConfidence = patternData?.length
      ? patternData.reduce((sum, p) => sum + (p.confidence || 0), 0) / patternData.length
      : 0;

    // ============================================
    // RETENTION (simplified)
    // ============================================

    // Users who came back after first session
    const { data: userFirstSessions } = await supabaseAdmin
      .from('sessions')
      .select('user_id, started_at')
      .order('started_at', { ascending: true });

    const userFirstSessionDate: Record<string, Date> = {};
    const userSessionDates: Record<string, Date[]> = {};
    
    userFirstSessions?.forEach(s => {
      const date = new Date(s.started_at);
      if (!userFirstSessionDate[s.user_id]) {
        userFirstSessionDate[s.user_id] = date;
      }
      if (!userSessionDates[s.user_id]) {
        userSessionDates[s.user_id] = [];
      }
      userSessionDates[s.user_id].push(date);
    });

    // Day 1 retention: users with sessions on 2+ different days
    let day1Retained = 0;
    let day7Retained = 0;
    
    Object.entries(userSessionDates).forEach(([userId, dates]) => {
      if (dates.length < 2) return;
      
      const firstDate = userFirstSessionDate[userId];
      const uniqueDays = new Set(dates.map(d => d.toDateString())).size;
      
      if (uniqueDays >= 2) day1Retained++;
      
      // Check if they came back after 7 days
      const hasLaterSession = dates.some(d => {
        const daysDiff = (d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 7;
      });
      if (hasLaterSession) day7Retained++;
    });

    const totalUsersWithSessions = Object.keys(userFirstSessionDate).length;
    const retentionDay1 = totalUsersWithSessions ? (day1Retained / totalUsersWithSessions) * 100 : 0;
    const retentionDay7 = totalUsersWithSessions ? (day7Retained / totalUsersWithSessions) * 100 : 0;

    // ============================================
    // BUILD RESPONSE
    // ============================================

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        active: activeUsers,
        signups: {
          today: signupsToday || 0,
          week: signupsWeek || 0,
          month: signupsMonth || 0,
        },
        growth: userGrowth,
        retention: {
          day1: Math.round(retentionDay1),
          day7: Math.round(retentionDay7),
        },
      },
      engagement: {
        totalSessions: totalSessions || 0,
        completedSessions: completedSessions?.length || 0,
        avgFocusQuality: Math.round(avgFocusQuality * 10) / 10,
        avgSessionsPerUser: Math.round(sessionsPerUser * 10) / 10,
        topUsers,
        hourlyActivity,
      },
      interventions: {
        total: totalInterventions || 0,
        accepted: acceptedInterventions,
        effective: effectiveInterventions,
        acceptRate: Math.round(interventionAcceptRate),
        effectiveRate: Math.round(interventionEffectiveRate),
        variantStats,
      },
      patterns: {
        total: totalPatterns || 0,
        avgConfidence: Math.round(avgPatternConfidence * 100),
      },
      waitlist: {
        total: totalWaitlist || 0,
        today: waitlistToday || 0,
        week: waitlistWeek || 0,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper: aggregate data by day
function aggregateByDay(data: any[], dateField: string): Record<string, number> {
  const result: Record<string, number> = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    result[date] = (result[date] || 0) + 1;
  });
  
  return result;
}