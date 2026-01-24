import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, HeatmapCell } from '@/types';
import { generateDashboardInsights } from '@/lib/ai-service';
import { evaluateInsightQuality } from '@/lib/evaluators';
import { logEvaluation } from '@/lib/opik';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todaySessions, error: todayError } = await supabase
      .from('sessions')
      .select('focus_quality')
      .eq('user_id', user.id)
      .gte('started_at', todayStart.toISOString())
      .not('focus_quality', 'is', null);

    if (todayError) throw todayError;

    const todayScore = todaySessions.length > 0
      ? Math.round(
          (todaySessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / todaySessions.length) * 10
        )
      : 0;


    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const { data: lastWeekSessions, error: lastWeekError } = await supabase
      .from('sessions')
      .select('focus_quality')
      .eq('user_id', user.id) // CHANGED
      .gte('started_at', lastWeekStart.toISOString())
      .lt('started_at', todayStart.toISOString())
      .not('focus_quality', 'is', null);

    if (lastWeekError) throw lastWeekError;

    const lastWeekScore = lastWeekSessions.length > 0
      ? Math.round(
          (lastWeekSessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / lastWeekSessions.length) * 10
        )
      : 0;

    const weeklyTrend = lastWeekScore > 0
      ? Math.round(((todayScore - lastWeekScore) / lastWeekScore) * 100)
      : 0;

    const { data: heatmapSessions, error: heatmapError } = await supabase
      .from('sessions')
      .select('started_at, focus_quality')
      .eq('user_id', user.id)
      .gte('started_at', lastWeekStart.toISOString())
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: true });

    if (heatmapError) throw heatmapError;

    const heatmapData: HeatmapCell[] = processHeatmapData(heatmapSessions || []);

    const { data: sessionsForAI, error: aiError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', lastWeekStart.toISOString())
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: false })
      .limit(20);

    if (aiError) throw aiError;

    console.log('🤖 Generating AI insights for', sessionsForAI?.length || 0, 'sessions...');
    
    const insights = (sessionsForAI && sessionsForAI.length >= 3)
      ? await generateDashboardInsights(sessionsForAI, user.id) 
      : ['Complete a few more sessions to unlock AI-powered insights.'];

    console.log('✅ AI insights generated:', insights);


    if (sessionsForAI && sessionsForAI.length >= 3) {
      const qualityScore = await evaluateInsightQuality(insights, sessionsForAI);
      
      await logEvaluation({
        name: 'insight_quality',
        traceId: `dashboard_${Date.now()}`,
        score: qualityScore / 10,
        metadata: {
          userId: user.id, 
          sessionCount: sessionsForAI.length,
          insightCount: insights.length,
          rawScore: qualityScore,
        },
      });

      console.log(`📊 Insight quality score: ${qualityScore}/10`);
    }

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

function processHeatmapData(sessions: any[]): HeatmapCell[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeBlocks = ['9am', '12pm', '3pm', '6pm', '9pm'];
  const heatmap: HeatmapCell[] = [];

  days.forEach(day => {
    timeBlocks.forEach(timeBlock => {
      const relevantSessions = sessions.filter(session => {
        const date = new Date(session.started_at);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = date.getHours();
        
        let blockMatch = false;
        if (timeBlock === '9am' && hour >= 9 && hour < 12) blockMatch = true;
        if (timeBlock === '12pm' && hour >= 12 && hour < 15) blockMatch = true;
        if (timeBlock === '3pm' && hour >= 15 && hour < 18) blockMatch = true;
        if (timeBlock === '6pm' && hour >= 18 && hour < 21) blockMatch = true;
        if (timeBlock === '9pm' && (hour >= 21 || hour < 9)) blockMatch = true;
        
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