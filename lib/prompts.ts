import type { Session } from '@/types';

// ============================================
// PATTERN ANALYSIS PROMPT
// ============================================
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

// ============================================
// INTERVENTION PROMPT - COMPANION VOICE
// ============================================
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
  const minutesLeft = context.plannedDuration - context.elapsedMinutes;

  // Context about the user
  const userContext = context.userPatterns.length > 0 
    ? `\nWhat we know about this user:\n${context.userPatterns.map(p => `- ${p}`).join('\n')}`
    : '';

  const recentMood = context.recentCheckIns.length > 0
    ? `\nRecent check-ins this session: ${context.recentCheckIns.join(', ')}`
    : '';

  const checkpointGuidance = {
    early: `EARLY CHECKPOINT (${percentComplete}% in, ${context.elapsedMinutes} mins)

Purpose: Light touch. They're building momentum. Don't disrupt — just let them know you're here.

Tone: Casual, brief, encouraging. Like a friend poking their head in.

Good examples:
- "How's it going so far?"
- "${context.elapsedMinutes} mins in. Finding your groove?"
- "Settling in okay?"

Bad examples:
- "Great job so far!" (too cheerleader-y)
- "Keep up the amazing work!" (cringe)
- "You've got this, buddy!" (AI voice)`,

   mid: `MID CHECKPOINT (${percentComplete}% in, ${context.elapsedMinutes} mins)

Purpose: This is where focus typically wavers. Acknowledge that this part is hard. Don't be a cheerleader.

Tone: Calm, real, understanding. You know this is the tough part. Don't pump them up — just check in.

GOOD examples (use this style):
- "Halfway there. Still with it?"
- "This is usually the hard part. How's focus?"
- "${context.elapsedMinutes} mins in. Doing okay?"
- "Past the middle. Still locked in?"

BAD examples (NEVER use):
- "You're in the thick of it!" (too intense)
- "Keep pushing!" (cheerleader)
- "Can you push to X mins strong?" (pressure)
- "You're crushing it!" (cringe)
- Any message with exclamation marks

Your message must be CALM. No exclamation marks. No "push" or "strong" or "crushing".`,

    late: `LATE CHECKPOINT (${percentComplete}% in, ${minutesLeft} mins left)

Purpose: They're in the home stretch. Suggest a quick physical reset — stretch, move, breathe. Bodies need it.

Tone: Practical and caring. Like someone who notices you've been hunched over too long.

Good examples:
- "${minutesLeft} mins left. Roll your shoulders real quick?"
- "Almost there. When did you last blink properly?"
- "Home stretch. Hands feeling tight? Shake 'em out."
- "Final push. Take 3 deep breaths first?"

Bad examples:
- "You're almost at the finish line!" (cheesy)
- "Final sprint!" (too intense)
- "Don't give up now!" (implies they might)`
  };

  return `You're a focus companion for someone who struggles with concentration. They're ${context.elapsedMinutes} minutes into a ${context.plannedDuration}-minute session working on: "${context.taskDescription}"

${checkpointGuidance[context.checkpoint]}
${userContext}
${recentMood}

CRITICAL RULES:
1. This is a ${context.plannedDuration}-MINUTE session. NEVER mention any other duration.
2. They are ${context.elapsedMinutes} mins in, ${minutesLeft} mins left. Use ONLY these numbers.
3. NEVER say "you've got this", "great progress", "amazing", "buddy", "friend"
4. 8-15 words MAXIMUM. No long sentences.
5. Sound like a calm text from a friend, not a coach
6. ONE emoji max, only if natural
7. For LATE checkpoint: suggest something physical (stretch, breathe, move)
8. NEVER invent or hallucinate numbers. Only use: ${context.elapsedMinutes}, ${minutesLeft}, ${context.plannedDuration}, ${percentComplete}%

Return ONLY a JSON object:
{
  "message": "Your message here",
  "strategy": "push_through" | "check_in" | "take_break",
  "reasoning": "Brief explanation of why this message"
}

Strategy guide:
- early → "push_through" (let them build momentum)
- mid → "check_in" (acknowledge the hard middle part)
- late → "take_break" (quick physical reset before final push)

Write the message now.`;
}

// ============================================
// DASHBOARD INSIGHTS PROMPT - COMPANION VOICE
// ============================================
export function buildDashboardInsightsPrompt(sessions: Session[]): string {
  // Process session data
  const sessionData = sessions.map(s => ({
    task_type: s.task_type,
    focus_quality: s.focus_quality,
    duration: s.actual_duration,
    planned: s.planned_duration,
    distractions: s.distraction_count,
    day: new Date(s.started_at).toLocaleDateString('en-US', { weekday: 'long' }),
    hour: new Date(s.started_at).getHours(),
    completed: s.actual_duration && s.actual_duration >= (s.planned_duration * 0.8),
  }));

  // Calculate some stats for context
  const totalSessions = sessionData.length;
  const avgFocus = sessionData.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / totalSessions;
  const totalMinutes = sessionData.reduce((sum, s) => sum + (s.duration || 0), 0);

  return `Generate 2-3 insights for someone who struggles with focus. These appear on their home screen.

SESSION DATA (${totalSessions} sessions, ${totalMinutes} total minutes, ${avgFocus.toFixed(1)} avg focus):
${JSON.stringify(sessionData, null, 2)}

YOUR ROLE:
You're their focus companion. You notice patterns and share observations that help them understand their own brain better. You're not grading them — you're helping them discover what works FOR THEM.

INSIGHT RULES:
1. Lead with curiosity, not judgment ("Interesting — your Tuesday sessions..." not "You struggle on Tuesdays")
2. Frame patterns as discoveries, not problems ("You focus 40% better before noon" not "Your afternoon focus is weak")
3. Always include something encouraging or hopeful
4. Be specific — use actual numbers from their data
5. If they're improving, celebrate it genuinely (not cheesy)
6. If data is limited, say so honestly and encourage more sessions
7. Each insight: 12-20 words, one clear observation

GOOD INSIGHTS:
- "Your morning sessions average 7.8 focus — you might be a morning person."
- "Interesting: coding sessions over 30 mins show stronger focus than shorter ones."
- "You've completed 4 sessions this week. That consistency is building something."
- "Wednesdays are your strongest day. Something about midweek works for you."

BAD INSIGHTS:
- "Great job on your progress!" (empty praise)
- "You should try to focus more in the afternoons." (judgey, generic)
- "Keep up the amazing work!" (meaningless)
- "Your focus needs improvement on Fridays." (negative framing)

IMPORTANT: Return ONLY a JSON array. No other text, no markdown, no explanation.

Format exactly like this:
["First insight here.", "Second insight here.", "Third insight here."]

If fewer than 3 sessions, return 1-2 insights max and acknowledge limited data.

Return the JSON array now.`;
}