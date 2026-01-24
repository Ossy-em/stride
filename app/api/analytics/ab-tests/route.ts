import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateABTestStats } from '@/lib/ab-testing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase
      .from('interventions')
      .select(`
        *,
        sessions!inner(
          user_id,
          task_type,
          focus_quality,
          distraction_count
        )
      `)
      .not('variant_type', 'is', null)
      .not('timing_offset', 'is', null);

    if (userId) {
      query = query.eq('sessions.user_id', userId);
    }

    const { data: interventions, error } = await query;

    if (error) {
      console.error('Error fetching interventions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch interventions' },
        { status: 500 }
      );
    }

    if (!interventions || interventions.length === 0) {
      return NextResponse.json({
        stats: [],
        totalInterventions: 0,
        message: 'No A/B test data available yet. Complete some sessions to generate results.'
      });
    }

    // Calculate detailed statistics
    const stats = calculateABTestStats(interventions);

    // Overall metrics
    const totalInterventions = interventions.length;
    const totalEffective = interventions.filter(i => i.effective === true).length;
    const overallEffectiveness = (totalEffective / totalInterventions) * 100;

    // Best performing variant
    const bestVariant = stats[0];

    // Group by variant type
    const byVariantType = new Map<string, any[]>();
    interventions.forEach(i => {
      if (!byVariantType.has(i.variant_type)) {
        byVariantType.set(i.variant_type, []);
      }
      byVariantType.get(i.variant_type)!.push(i);
    });

    const variantComparison = Array.from(byVariantType.entries()).map(([variant, data]) => {
      const effective = data.filter(i => i.effective === true).length;
      return {
        variant,
        count: data.length,
        effectiveCount: effective,
        effectivenessRate: (effective / data.length) * 100
      };
    });

    // Group by timing offset
    const byTiming = new Map<number, any[]>();
    interventions.forEach(i => {
      if (!byTiming.has(i.timing_offset)) {
        byTiming.set(i.timing_offset, []);
      }
      byTiming.get(i.timing_offset)!.push(i);
    });

    const timingComparison = Array.from(byTiming.entries()).map(([timing, data]) => {
      const effective = data.filter(i => i.effective === true).length;
      return {
        timingOffset: timing,
        count: data.length,
        effectiveCount: effective,
        effectivenessRate: (effective / data.length) * 100
      };
    }).sort((a, b) => b.effectivenessRate - a.effectivenessRate);

    return NextResponse.json({
      summary: {
        totalInterventions,
        totalEffective,
        overallEffectiveness: overallEffectiveness.toFixed(1),
        bestVariant: bestVariant ? {
          type: bestVariant.variantType,
          timing: bestVariant.timingOffset,
          effectiveness: bestVariant.effectivenessRate.toFixed(1)
        } : null
      },
      detailedStats: stats,
      variantComparison,
      timingComparison,
      rawData: interventions.map(i => ({
        id: i.id,
        variant: i.variant_type,
        timing: i.timing_offset,
        effective: i.effective,
        userAction: i.user_action,
        taskType: i.sessions?.task_type,
        triggeredAt: i.triggered_at
      }))
    });

  } catch (error) {
    console.error('Error generating A/B test analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
