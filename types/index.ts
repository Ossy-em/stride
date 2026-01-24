export type TaskType = 'coding' | 'writing' | 'reading';

export type CheckInResponse = 'focused' | 'neutral' | 'distracted';

export type InterventionStrategy = 'take_break' | 'switch_task' | 'push_through' | 'check_in';

export interface Session {
  id: string;
  user_id: string;
  task_description: string;
  task_type: TaskType;
  planned_duration: number; 
  actual_duration?: number;
  focus_quality?: number;
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
  confidence: number; 
  detected_at: string;
}

export interface DashboardStats {
  today_focus_score: number;
  weekly_trend: number; 
  heatmap_data: HeatmapCell[];
  insights: string[];
}

export interface HeatmapCell {
  day: string; 
  time_block: string; 
  avg_focus_quality: number; 
  session_count: number;
}