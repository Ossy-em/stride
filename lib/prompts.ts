import type { Session } from '@/types';


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

export function buildInterventionPrompt(context: {
  taskDescription: string;
  taskType: string;
  elapsedMinutes: number;
  plannedDuration: number;
  checkpoint: 'early' | 'mid' | 'late';
  userPatterns: string[];
  recentCheckIns: string[];
}): string {
  
  const percentComplete = Math.round((context.elapsedMinutes / context.plannedDuration) * 100);

  const checkpointExamples = {
    early: `
Examples for EARLY checkpoint (${percentComplete}%):
"How's your focus so far?"
"${context.elapsedMinutes} minutes in. Still feeling sharp?"
"Getting into the flow?"`,
    
    mid: `
Examples for MID checkpoint (${percentComplete}%):
"Halfway there, keep pushing! 👊🏼"
"${context.elapsedMinutes} minutes down. Still locked in?"
"You're crushing the midpoint."`,
    
    late: `
Examples for LATE checkpoint (${percentComplete}%):
"You're ${percentComplete}% into your session. Mind cracking your knuckles a bit?"
"Almost done. Stretch your neck quick?"
"${percentComplete}% through. Take 30 seconds to stretch your hands?"`
  };

  return `You are texting a friend who's ${context.elapsedMinutes} minutes into a ${context.plannedDuration}-minute work session.

CHECKPOINT: ${context.checkpoint.toUpperCase()}
Progress: ${context.elapsedMinutes}/${context.plannedDuration} mins (${percentComplete}%)

${checkpointExamples[context.checkpoint]}

Your message must:
- Be 8-15 words maximum
- Be accurate to their progress (${percentComplete}%)
- Sound like a real person texting
- For LATE checkpoint: suggest quick physical breaks (stretch, crack knuckles, etc.)
- You CAN use ONE emoji if it fits (👊🏼 for motivation, not excessive)
- NO AI words like "friend", "buddy", "pal"

BAD examples (don't use):
"Keep up the great work, friend!" (too AI)
"You're doing amazing!" (cheesy)
"Halfway there" when they're at 20% (wrong math)

Return ONLY a JSON object:
{
  "message": "Your message here",
  "strategy": "push_through" | "check_in" | "take_break"
}

Strategy rules:
- early: "push_through" (building momentum)
- mid: "check_in" (assess state)
- late: "take_break" (physical micro-break)

Write the message now. ${context.checkpoint} checkpoint. ${percentComplete}% complete. Go.`;
}

// PROMPT 3: Dashboard Insights (FIXED JSON FORMAT)
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

  return `Generate 3 actionable insights based on this user's focus sessions.

Session Data:
${JSON.stringify(weekData, null, 2)}

CRITICAL: You MUST return ONLY a JSON array. No preamble, no explanation, no markdown.

Format (EXACTLY like this):
["Insight 1 here", "Insight 2 here", "Insight 3 here"]

Each insight should:
- Be one sentence (15-25 words)
- Reference specific data
- Be actionable
- Sound encouraging

BAD response: "Here are 3 insights for you: [...]"
GOOD response: ["Your coding focus averages 8.2/10 in mornings vs 6.1/10 afternoons.", "Reading sessions over 40 mins show 30% focus drop.", "You completed 4 sessions this week, up from 2 last week."]

If less than 3 sessions, return fewer insights.

Return the JSON array NOW. No other text.`;
}