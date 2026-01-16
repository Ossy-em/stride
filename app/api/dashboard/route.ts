import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, HeatmapCell } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user ID from auth session
    const mockUserId = '00000000-0000-0000-0000-000000000001';

    // Get today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todaySessions, error: todayError } = await supabase
      .from('sessions')
      .select('focus_quality')
      .eq('user_id', mockUserId)
      .gte('started_at', todayStart.toISOString())
      .not('focus_quality', 'is', null);

    if (todayError) throw todayError;

    // Calculate today's average focus score (scale 1-10 to 0-100)
    const todayScore = todaySessions.length > 0
      ? Math.round(
          (todaySessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / todaySessions.length) * 10
        )
      : 0;

    // Get last week's sessions for comparison
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const { data: lastWeekSessions, error: lastWeekError } = await supabase
      .from('sessions')
      .select('focus_quality')
      .eq('user_id', mockUserId)
      .gte('started_at', lastWeekStart.toISOString())
      .lt('started_at', todayStart.toISOString())
      .not('focus_quality', 'is', null);

    if (lastWeekError) throw lastWeekError;

    const lastWeekScore = lastWeekSessions.length > 0
      ? Math.round(
          (lastWeekSessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / lastWeekSessions.length) * 10
        )
      : 0;

    // Calculate weekly trend percentage
    const weeklyTrend = lastWeekScore > 0
      ? Math.round(((todayScore - lastWeekScore) / lastWeekScore) * 100)
      : 0;

    // Get heatmap data (last 7 days)
    const { data: recentSessions, error: recentError } = await supabase
      .from('sessions')
      .select('started_at, focus_quality')
      .eq('user_id', mockUserId)
      .gte('started_at', lastWeekStart.toISOString())
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: true });

    if (recentError) throw recentError;

    // Process heatmap data
    const heatmapData: HeatmapCell[] = processHeatmapData(recentSessions);

    // Get AI insights (mock for now, will replace with real AI)
    const insights = generateMockInsights(todaySessions.length, todayScore);

    const dashboardStats: DashboardStats = {
      today_focus_score: todayScore,
      weekly_trend: weeklyTrend,
      heatmap_data: heatmapData,
      insights,
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to process heatmap data
function processHeatmapData(sessions: any[]): HeatmapCell[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeBlocks = ['9am', '12pm', '3pm', '6pm', '9pm'];
  const heatmap: HeatmapCell[] = [];

  days.forEach(day => {
    timeBlocks.forEach(timeBlock => {
      // Filter sessions for this day/time combination
      const relevantSessions = sessions.filter(session => {
        const date = new Date(session.started_at);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = date.getHours();
        
        // Map time blocks to hour ranges
        let blockMatch = false;
        if (timeBlock === '9am' && hour >= 9 && hour < 12) blockMatch = true;
        if (timeBlock === '12pm' && hour >= 12 && hour < 15) blockMatch = true;
        if (timeBlock === '3pm' && hour >= 15 && hour < 18) blockMatch = true;
        if (timeBlock === '6pm' && hour >= 18 && hour < 21) blockMatch = true;
        if (timeBlock === '9pm' && hour >= 21 || hour < 9) blockMatch = true;
        
        return dayName === day && blockMatch;
      });

      const avgFocus = relevantSessions.length > 0
        ? relevantSessions.reduce((sum, s) => sum + s.focus_quality, 0) / relevantSessions.length
        : 0;

      heatmap.push({
        day,
        time_block: timeBlock,
        avg_focus_quality: avgFocus,
        session_count: relevantSessions.length,
      });
    });
  });

  return heatmap;
}

// Mock insights (will be replaced with AI-generated insights)
function generateMockInsights(sessionCount: number, score: number): string[] {
  if (sessionCount === 0) return [];

  const insights: string[] = [];

  if (score >= 80) {
    insights.push("Your focus has been exceptional today. Morning sessions seem to work best for you.");
  } else if (score >= 60) {
    insights.push("Solid focus patterns emerging. Try scheduling deep work between 9-11am.");
  } else {
    insights.push("Focus dips noticed after 45 minutes. Consider shorter, more frequent sessions.");
  }

  if (sessionCount > 3) {
    insights.push("You're building consistency. Three focused sessions daily correlates with your best work.");
  }

  insights.push("Coding tasks show 30% better focus in morning hours compared to afternoons.");

  return insights;
}