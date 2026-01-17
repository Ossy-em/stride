import type { Session } from '@/types';

// PROMPT 1: Pattern Analysis
// Called after each session to identify user patterns
export function buildPatternAnalysisPrompt(sessions: Session[]): string {
  const sessionData = sessions.map(s => ({
    task: s.task_description,
    type: s.task_type,
    planned: s.planned_duration,
    actual: s.actual_duration,
    focus: s.focus_quality,
    distractions: s.distraction_count,
    time: new Date(s.started_at).toLocaleString('en-US', { 
      weekday: 'short', 
      hour: 'numeric', 
      hour12: true 
    }),
  }));

  return `Analyze this user's focus patterns from their recent work sessions.

Sessions (most recent first):
${JSON.stringify(sessionData, null, 2)}

Task types explained:
- "coding" = Development & Technical Work
- "writing" = Writing & Creative Work  
- "reading" = Reading & Learning

Identify specific patterns:
1. When does focus typically drop? (time into session, time of day)
2. Which task types show best focus quality?
3. Optimal session length per task type
4. Any triggers for distraction (task switching, time of day, session length)

Return ONLY a JSON object with this structure:
{
  "patterns": [
    {
      "type": "session_length",
      "insight": "Focus drops after 45 minutes on writing tasks",
      "confidence": 0.85
    },
    {
      "type": "time_of_day", 
      "insight": "Morning sessions (9-11am) show 30% better focus for reading",
      "confidence": 0.75
    }
  ],
  "recommendations": [
    "Schedule writing tasks for morning hours when focus peaks",
    "Keep reading sessions under 40 minutes for optimal retention"
  ]
}

Be specific and data-driven. Avoid generic advice. If patterns aren't clear yet (less than 5 sessions), say so.`;
}

// PROMPT 2: Intervention Generation
// Called when it's time to intervene during active session
export function buildInterventionPrompt(context: {
  taskDescription: string;
  taskType: string;
  elapsedMinutes: number;
  userPatterns: string[];
  recentCheckIns: string[];
}): string {
  return `Generate a brief intervention message for a user currently in a focus session.

Current Context:
- Task: "${context.taskDescription}"
- Task Type: ${context.taskType}
- Elapsed Time: ${context.elapsedMinutes} minutes
- Known Patterns: ${context.userPatterns.join('; ')}
- Recent Check-ins: ${context.recentCheckIns.join(', ')}

Create a helpful, non-intrusive intervention message that:
1. Acknowledges their current work
2. References their specific pattern (if relevant)
3. Suggests a concrete action

Tone Guidelines:
- Supportive coach, not nagging reminder
- 2-3 sentences maximum
- Natural language, casual but respectful
- Task-specific phrasing:
  * Writing: "finish your thought", "wrap up this section"
  * Reading: "mark your page", "process what you've learned"
  * Coding: "save your work", "commit your changes"

Return ONLY a JSON object:
{
  "message": "You've been writing for 42 minutes. Your focus typically peaks around 50 minutes. Wrap up this section, then take a 5-minute walk?",
  "strategy": "take_break",
  "reasoning": "User's pattern shows focus drops at 50 minutes for writing tasks"
}

Strategy options: "take_break", "switch_task", "push_through"`;
}

// PROMPT 3: Dashboard Insights
// Called daily/weekly to generate user-facing insights
export function buildDashboardInsightsPrompt(sessions: Session[]): string {
  const weekData = sessions.map(s => ({
    task_type: s.task_type,
    focus_quality: s.focus_quality,
    duration: s.actual_duration,
    time: new Date(s.started_at).toLocaleString('en-US', { 
      weekday: 'short', 
      hour: 'numeric' 
    }),
  }));

  return `Generate 3 actionable insights for a user based on their week's focus sessions.

Session Data:
${JSON.stringify(weekData, null, 2)}

Create insights that are:
1. Specific (reference actual data, not generic advice)
2. Actionable (user can immediately apply them)
3. Positive framing (focus on wins, not failures)
4. Varied (don't repeat similar points)

Examples of GOOD insights:
- "Your writing focus averages 8.2/10 in morning sessions vs 6.1/10 in afternoons. Schedule creative work before lunch."
- "Reading sessions over 40 minutes show a 30% drop in focus quality. Try 35-minute blocks with 5-minute breaks."
- "You completed 4 focused sessions this week vs 2 last week. Consistency is building."

Examples of BAD insights:
- "You should focus better" (not specific)
- "Try to avoid distractions" (not actionable)
- "Your focus was 6.5/10 on average" (just stating a number)

Return ONLY a JSON array of exactly 3 strings:
[
  "Insight 1 here",
  "Insight 2 here", 
  "Insight 3 here"
]

If there's insufficient data (less than 3 sessions), return fewer insights or encouraging messages about building consistency.`;
}