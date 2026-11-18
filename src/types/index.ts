
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

// HOME API RESPONSE (/api/home)
export interface HomeResponse {

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

/** @deprecated Renamed to HomeResponse (Dashboard is now Home). */
export type DashboardResponse = HomeResponse;

// SESSIONS PAGE (/api/sessions)
export type SessionStatus = 'completed' | 'in_progress' | 'unsaved';

export interface SessionHistoryItem {
  id: string;
  task: string;
  taskType: string;
  plannedMinutes: number;
  actualMinutes: number | null;
  focusQuality: number | null; // 1-10
  distractions: number | null;
  outcome: string | null;
  startedAt: string; // ISO, UTC
  endedAt: string | null;
  nudges: number;
  nudgesAccepted: number;
  status: SessionStatus;
}

export interface SessionHistoryResponse {
  range: '7d' | '30d' | 'all';
  sessions: SessionHistoryItem[];
}

// ---- Goals ----
export interface Goal {
  id: string;
  title: string;
  /** null = no target, just tracking time */
  targetMinutes: number | null;
  /** YYYY-MM-DD */
  dueDate: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt: string | null;
  /** focus minutes from saved sessions linked to this goal */
  minutes: number;
  sessions: number;
  lastSessionAt: string | null;
  stepsDone: number;
  stepsTotal: number;
}

export interface GoalStep {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export interface GoalDetail {
  goal: Goal;
  steps: GoalStep[];
  /** saved sessions that counted towards this goal, newest first */
  sessions: { id: string; task: string; startedAt: string; minutes: number; focusQuality: number | null }[];
}

export interface GoalsResponse {
  week: {
    /** null = no weekly target set */
    targetMinutes: number | null;
    minutes: number;
    sessions: number;
    /** Monday..Sunday in the user's timezone, YYYY-MM-DD */
    days: { date: string; minutes: number }[];
  };
  goals: Goal[];
}
