export type TaskType = 'coding' | 'writing' | 'reading';

export type CheckInResponse = 'focused' | 'neutral' | 'distracted';

export type InterventionStrategy = 'take_break' | 'switch_task' | 'push_through';

export interface Session {
  id: string;
  user_id: string;
  task_description: string;
  task_type: TaskType;
  planned_duration: number; // minutes
  actual_duration?: number;
  focus_quality?: number; // 1-10
  distraction_count: number;
  outcome?: string;
  started_at: string;
  ended_at?: string;
}

export interface CheckIn {
  id: string;
  session_id: string;
  timestamp: string;
  response: CheckInResponse;
  note?: string;
}

export interface Intervention {
  id: string;
  session_id: string;
  triggered_at: string;
  message: string;
  strategy: InterventionStrategy;
  user_action?: 'accepted' | 'dismissed' | 'ignored';
  effective?: boolean;
}

export interface Pattern {
  id: string;
  user_id: string;
  pattern_type: 'time_of_day' | 'task_type' | 'session_length';
  insight: string;
  confidence: number; // 0.00 to 1.00
  detected_at: string;
}

export interface DashboardStats {
  today_focus_score: number;
  weekly_trend: number; // percentage change
  heatmap_data: HeatmapCell[];
  insights: string[];
}

export interface HeatmapCell {
  day: string; // 'Mon', 'Tue', etc.
  time_block: string; // '9am', '12pm', etc.
  avg_focus_quality: number; // 0-10
  session_count: number;
}