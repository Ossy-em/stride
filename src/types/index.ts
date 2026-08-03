
// USER
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

// SESSION
export interface Session {
  id: string;
  user_id: string;
  task_description: string;
    task_type: string;
  planned_duration: number;
  actual_duration?: number;
  focus_quality?: number;
  distraction_count?: number;
  outcome?: string;
  started_at: string;
  ended_at?: string;
}

// CHECK-IN
export type CheckInResponse = 'focused' | 'neutral' | 'distracted';

export interface CheckIn {
  id: string;
  session_id: string;
  response: CheckInResponse;
  note?: string;
  created_at: string;
  minute_mark?: number; // When in the session this happened
}

// INTERVENTION
export type InterventionStrategy = 'take_break' | 'switch_task' | 'push_through' | 'check_in';

export interface Intervention {
  id: string;
  session_id: string;
  message: string;
  strategy: InterventionStrategy;
  checkpoint: string;
  accepted: boolean;
  created_at: string;
  minute_mark?: number;
}

// DASHBOARD API RESPONSE
export interface DashboardResponse {

  user: {
    firstName: string | null;
  };

  greeting: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    message: string;
    subMessage: string | null;
  };

  // Today's stats
  today: {
    score: number | null;
    sessions: number;
    focusMinutes: number;
  };

  // Yesterday (for comparison)
  yesterday: {
    score: number | null;
    sessions: number;
    focusMinutes: number;
  };

  // Streak
  streak: {
    current: number;
    longest: number;
    isAtRisk: boolean; 
  };

  // This week
  week: {
    sessions: number;
    avgScore: number;
    trend: number; 
    focusMinutes: number;
  };

  // Patterns (teaser for Focus Fingerprint)
  patterns: {
    peakHours: {
      start: number;
      end: number;
      improvement: number;
    } | null;
    bestDay: {
      day: string;
      avgScore: number;
    } | null;
    avgSessionMinutes: number;
    suggestedDuration: number;
  };

  // Personal records
  records: {
    longestSession: number;
    highestFocusScore: number;
    totalSessions: number;
    totalFocusMinutes: number;
  };

  // AI insights
  insights: string[];

  // New user flag
  isNewUser: boolean;
}

// FOCUS FINGERPRINT (Patterns Page)
export interface FocusFingerprintData {
  // Peak performance
  peakHours: {
    start: number;
    end: number;
    improvement: number;
    sessionCount: number;
  } | null;

  // Drift patterns
  driftPattern: {
    typicalMinute: number; // When they usually drift
    interventionSuccess: number; // % of times intervention helped
  } | null;

  // Discoveries
  discoveries: {
    type: 'positive' | 'negative' | 'neutral';
    insight: string;
  }[];

  // Growth over time
  growth: {
    firstWeekAvg: number;
    recentAvg: number;
    firstWeekDrifts: number;
    recentDrifts: number;
    improvement: number; // %
  } | null;

  // Day breakdown
  dayBreakdown: {
    day: string;
    avgScore: number;
    sessionCount: number;
  }[];

  // Hour breakdown
  hourBreakdown: {
    hour: number;
    avgScore: number;
    sessionCount: number;
  }[];
}

// HEATMAP (Legacy - keep for compatibility)
export interface HeatmapCell {
  day: string;
  time_block: string;
  avg_focus_quality: number;
  session_count: number;
}

// LEGACY DASHBOARD STATS (for backward compat)
export interface DashboardStats {
  today_focus_score: number;
  weekly_trend: number;
  heatmap_data: HeatmapCell[];
  insights: string[];
}