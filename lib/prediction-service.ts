import { supabase } from './supabase';
import type { Session } from '@/types';
import { assignVariant, applyTimingOffset, type ABTestVariant } from './ab-testing';

interface PredictionResult {
  shouldIntervene: boolean;
  predictedMinutes: number;
  confidence: number;
  reasoning: string;
  variant?: ABTestVariant;
  interventionMinute?: number;
  checkpoint?: 'early' | 'mid' | 'late'; 
}

export async function predictInterventionTiming(
  userId: string,
  currentSession: {
    taskType: string;
    elapsedMinutes: number;
    plannedDuration: number; 
  }
): Promise<PredictionResult> {
  try {
    const TESTING_MODE = true; // Keep true for demo
    
    // Assign A/B test variant
    const variant = assignVariant();
    
  
    const checkpoints = {
      early: Math.round(currentSession.plannedDuration * 0.20),
      mid: Math.round(currentSession.plannedDuration * 0.50),   
      late: Math.round(currentSession.plannedDuration * 0.80),  
    };

 
    let checkpoint: 'early' | 'mid' | 'late' | null = null;
    let interventionMinute = 0;

    if (currentSession.elapsedMinutes >= checkpoints.late) {
      checkpoint = 'late';
      interventionMinute = checkpoints.late;
    } else if (currentSession.elapsedMinutes >= checkpoints.mid) {
      checkpoint = 'mid';
      interventionMinute = checkpoints.mid;
    } else if (currentSession.elapsedMinutes >= checkpoints.early) {
      checkpoint = 'early';
      interventionMinute = checkpoints.early;
    }

    if (TESTING_MODE && checkpoint) {
      return {
        shouldIntervene: true,
        predictedMinutes: currentSession.plannedDuration,
        confidence: 1.0,
        reasoning: `[DEMO MODE] ${checkpoint.toUpperCase()} checkpoint (${interventionMinute}min = ${checkpoint === 'early' ? '20' : checkpoint === 'mid' ? '50' : '80'}% of ${currentSession.plannedDuration}min session)`,
        variant,
        interventionMinute,
        checkpoint,
      };
    }

    // PRODUCTION MODE: Use historical data (keep this for after hackathon)
    const { data: historicalSessions, error } = await supabase
      .from('sessions')
      .select('planned_duration, actual_duration, distraction_count, focus_quality')
      .eq('user_id', userId)
      .eq('task_type', currentSession.taskType)
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: false })
      .limit(10);

    if (error || !historicalSessions || historicalSessions.length < 3) {
      const defaultInterventionMinute = applyTimingOffset(45, variant.timingOffset);
      return {
        shouldIntervene: currentSession.elapsedMinutes >= defaultInterventionMinute,
        predictedMinutes: 45,
        confidence: 0.3,
        reasoning: 'Insufficient historical data - using default timing',
        variant,
        interventionMinute: defaultInterventionMinute,
      };
    }

    const focusDropPoints = historicalSessions
      .filter(s => s.focus_quality && s.focus_quality < 7)
      .map(s => s.actual_duration || s.planned_duration);

    if (focusDropPoints.length === 0) {
      const defaultInterventionMinute = applyTimingOffset(50, variant.timingOffset);
      return {
        shouldIntervene: currentSession.elapsedMinutes >= defaultInterventionMinute,
        predictedMinutes: 50,
        confidence: 0.7,
        reasoning: 'User maintains high focus - delaying intervention',
        variant,
        interventionMinute: defaultInterventionMinute,
      };
    }

    const avgDropTime = focusDropPoints.reduce((a, b) => a + b, 0) / focusDropPoints.length;
    const productionInterventionMinute = applyTimingOffset(avgDropTime, variant.timingOffset);
    const shouldIntervene = currentSession.elapsedMinutes >= productionInterventionMinute;

    const variance = focusDropPoints.reduce((sum, t) => sum + Math.pow(t - avgDropTime, 2), 0) / focusDropPoints.length;
    const confidence = Math.max(0.5, Math.min(1, 1 - (variance / 400)));

    return {
      shouldIntervene,
      predictedMinutes: Math.round(avgDropTime),
      confidence,
      reasoning: `Based on ${focusDropPoints.length} sessions, focus drops at ${Math.round(avgDropTime)}min. Intervening at ${productionInterventionMinute}min.`,
      variant,
      interventionMinute: productionInterventionMinute,
    };

  } catch (error) {
    console.error('Error predicting intervention timing:', error);
    const variant = assignVariant();
    const defaultInterventionMinute = applyTimingOffset(45, variant.timingOffset);
    
    return {
      shouldIntervene: currentSession.elapsedMinutes >= defaultInterventionMinute,
      predictedMinutes: 45,
      confidence: 0.3,
      reasoning: 'Error analyzing patterns - using default',
      variant,
      interventionMinute: defaultInterventionMinute,
    };
  }
}

export async function checkInterventionNeeded(
  userId: string,
  sessionId: string,
  taskType: string,
  elapsedMinutes: number,
  plannedDuration: number
): Promise<{ needed: boolean; prediction?: PredictionResult }> {
  const prediction = await predictInterventionTiming(userId, {
    taskType,
    elapsedMinutes,
    plannedDuration,
  });

  return {
    needed: prediction.shouldIntervene,
    prediction,
  };
}