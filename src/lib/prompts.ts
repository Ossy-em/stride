import type { Session } from '../types';

// ============================================
// PATTERN ANALYSIS PROMPT
// ============================================
export function buildPatternAnalysisPrompt(sessions: Session[]): string {
  const sessionData = sessions.map(s => {
    const startDate = new Date(s.started_at);
    return {
      task: s.task_description,
      type: s.task_type,
      planned: s.planned_duration,
      actual: s.actual_duration,
      focus: s.focus_quality,
      distractions: s.distraction_count,
      day: startDate.toLocaleDateString('en-US', { weekday: 'long' }),
      hour: startDate.getHours(),
      time: startDate.toLocaleString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      completionRate: s.actual_duration && s.planned_duration
        ? Math.round((s.actual_duration / s.planned_duration) * 100)
        : null,
    };
  });

  // Pre-compute stats to help the LLM
  const avgFocus = sessionData.reduce((sum, s) => sum + (s.focus || 0), 0) / sessionData.length;
  const totalMinutes = sessionData.reduce((sum, s) => sum + (s.actual || 0), 0);

  const byTaskType: Record<string, { count: number; avgFocus: number; avgDuration: number }> = {};
  sessionData.forEach(s => {
    if (!byTaskType[s.type]) byTaskType[s.type] = { count: 0, avgFocus: 0, avgDuration: 0 };
    byTaskType[s.type].count++;
    byTaskType[s.type].avgFocus += s.focus || 0;
    byTaskType[s.type].avgDuration += s.actual || 0;
  });
  Object.values(byTaskType).forEach(v => {
    v.avgFocus = Math.round((v.avgFocus / v.count) * 10) / 10;
    v.avgDuration = Math.round(v.avgDuration / v.count);
  });

  const byDay: Record<string, { count: number; avgFocus: number }> = {};
  sessionData.forEach(s => {
    if (!byDay[s.day]) byDay[s.day] = { count: 0, avgFocus: 0 };
    byDay[s.day].count++;
    byDay[s.day].avgFocus += s.focus || 0;
  });
  Object.values(byDay).forEach(v => {
    v.avgFocus = Math.round((v.avgFocus / v.count) * 10) / 10;
  });

  const byHour: Record<number, { count: number; avgFocus: number }> = {};
  sessionData.forEach(s => {
    if (!byHour[s.hour]) byHour[s.hour] = { count: 0, avgFocus: 0 };
    byHour[s.hour].count++;
    byHour[s.hour].avgFocus += s.focus || 0;
  });
  Object.values(byHour).forEach(v => {
    v.avgFocus = Math.round((v.avgFocus / v.count) * 10) / 10;
  });

  // Split into first half vs recent half for growth
  const halfIdx = Math.floor(sessionData.length / 2);
  const firstHalf = sessionData.slice(halfIdx);
  const recentHalf = sessionData.slice(0, halfIdx);
  const firstAvg = firstHalf.reduce((s, x) => s + (x.focus || 0), 0) / Math.max(firstHalf.length, 1);
  const recentAvg = recentHalf.reduce((s, x) => s + (x.focus || 0), 0) / Math.max(recentHalf.length, 1);

  return `You are a focus coach analyzing a user's real focus behavior. Your analysis powers a "Focus Fingerprint" dashboard that should feel deeply personal and insightful.

AGGREGATE STATS:
- Total sessions: ${sessionData.length}
- Total focus time: ${totalMinutes} minutes
- Overall avg focus: ${avgFocus.toFixed(1)}/10
- Growth: first sessions avg ${firstAvg.toFixed(1)} → recent avg ${recentAvg.toFixed(1)}

BY TASK TYPE:
${JSON.stringify(byTaskType, null, 2)}

BY DAY OF WEEK:
${JSON.stringify(byDay, null, 2)}

BY HOUR OF DAY:
${JSON.stringify(byHour, null, 2)}

RAW SESSIONS (most recent first):
${JSON.stringify(sessionData, null, 2)}

ANALYSIS REQUIREMENTS:

1. DRIFT PATTERN: When does this user typically lose focus?
   - Identify the minute mark where focus drops (compare planned vs actual, focus scores over session lengths)
   - Be specific: "around minute 18" not "midway through"

2. PEAK PERFORMANCE: When is this user at their best?
   - Best time of day (use hour data)
   - Best day of week (use day data)
   - Best task type
   - Quantify the difference: "13% higher focus during morning sessions"

3. SESSION INSIGHTS: What works and what doesn't?
   - Optimal session length per task type
   - Completion rates (planned vs actual)
   - Does longer = worse focus, or can they sustain?

4. GROWTH TRAJECTORY: How is the user improving?
   - Compare first sessions vs recent sessions
   - Note specific improvements or regressions
   - Encourage with data, not platitudes

5. VULNERABILITY MAP: Where does this user struggle?
   - Specific task types that drain focus
   - Times of day to avoid deep work
   - Session lengths that are too ambitious

RULES:
- Every claim MUST reference specific numbers from the data
- If data is insufficient for a pattern (< 3 data points), say so explicitly
- Do NOT invent or extrapolate beyond the data
- Be specific and quantitative, not vague
- Confidence should reflect actual data strength: 3-4 sessions = 0.3-0.5, 5-9 = 0.5-0.7, 10+ = 0.7-0.9

Return ONLY this JSON:
{
  "patterns": [
    {
      "type": "drift_point | peak_time | peak_day | task_affinity | session_length | growth | vulnerability",
      "insight": "Specific, quantitative observation (e.g. 'Your focus drops sharply after minute 22 in coding sessions, averaging 5.2/10 vs 7.8/10 in the first 20 minutes')",
      "confidence": 0.0-1.0,
      "evidence": {
        "supporting_sessions": 0,
        "contradicting_sessions": 0,
        "notes": "Specific session references"
      }
    }
  ],
  "recommendations": [
    {
      "suggestion": "Actionable, specific suggestion based on the data",
      "based_on": "Which pattern this addresses",
      "expected_impact": "What improvement to expect"
    }
  ],
  "focus_fingerprint": {
    "drift_minute": null,
    "peak_hours": { "start": 0, "end": 0 },
    "best_day": "",
    "best_task_type": "",
    "optimal_session_length": 0,
    "growth_percentage": 0,
    "focus_style": "sprinter | marathoner | steady | variable"
  },
  "data_quality": {
    "session_count": ${sessions.length},
    "reliability": "low | medium | high",
    "notes": "Assessment of data completeness"
  }
}`;
}

// ============================================
// INTERVENTION PROMPT
// ============================================
export function buildInterventionPrompt(context: {
  taskDescription: string;
  taskType: string;
  elapsedMinutes: number;
  plannedDuration: number;
  checkpoint: 'early' | 'mid' | 'late';
  focusHistory: {
    currentSession: Array<{
      checkpoint: string;
      focusState: string | null;
      driftReason: string | null;
      action: string | null;
    }>;
    pastSessions: {
      totalInterventions: number;
      commonDriftReasons: Array<{ reason: string; count: number }>;
      focusStateAtCheckpoints: Array<{ checkpoint: string; avgState: string }>;
      breakEffectiveness: { helped: number; somewhat: number; notReally: number };
    };
    patterns: string[];
  };
}): string {
  const minutesLeft = context.plannedDuration - context.elapsedMinutes;
  const isShortSession = context.plannedDuration <= 15;
  const isMicroSession = context.plannedDuration <= 5;

  const personalization = buildPersonalizationContext(context);

  const sessionConstraint = isMicroSession
    ? `THIS IS A ${context.plannedDuration}-MINUTE MICRO SESSION.
- NEVER mention breaks of any kind
- NEVER reference times longer than ${context.plannedDuration} minutes
- Keep it to a quick pulse check
- The entire session is only ${context.plannedDuration} minutes, so any time reference must be within this range`
    : isShortSession
    ? `THIS IS A SHORT ${context.plannedDuration}-MINUTE SESSION.
- Do NOT suggest breaks
- Do NOT reference times longer than ${context.plannedDuration} minutes
- Keep messages brief and light`
    : `Session is ${context.plannedDuration} minutes total.`;

  const checkpointRules: Record<string, string> = {
    early: `CHECKPOINT: EARLY (${context.elapsedMinutes} of ${context.plannedDuration} mins done, ${minutesLeft} left)

GOAL: Gentle awareness check. Just a tap on the shoulder.

DO:
- Reference the task naturally if it fits
- Keep it casual and warm
- 6-12 words

DON'T:
- Mention breaks
- Give time management advice
- Be preachy or motivational`,

    mid: `CHECKPOINT: MID (${context.elapsedMinutes} of ${context.plannedDuration} mins done, ${minutesLeft} left)

GOAL: Check focus without breaking it. Like a friend glancing over.

DO:
- Acknowledge progress naturally
- Reference remaining time only if helpful
- 6-12 words

DON'T:
- Suggest long breaks
- Be overly encouraging
- Sound like a productivity app`,

    late: `CHECKPOINT: LATE (${context.elapsedMinutes} of ${context.plannedDuration} mins done, ${minutesLeft} left)

GOAL: Encourage finish. Light touch.

DO:
- Note the home stretch
- ${!isMicroSession && !isShortSession ? 'Suggest a quick physical reset (shoulders, breath) if natural' : 'Keep it simple, no physical suggestions for short sessions'}
- 6-12 words

DON'T:
- Introduce new tasks or ideas
- Be dramatic about finishing
- ${isShortSession ? 'Suggest any breaks' : 'Suggest breaks longer than 30 seconds'}`,
  };

  return `Generate a single focus check-in message.

CRITICAL CONSTRAINTS:
- This session is EXACTLY ${context.plannedDuration} minutes long
- The user is ${context.elapsedMinutes} minutes in with ${minutesLeft} minutes remaining
- NEVER mention any time value greater than ${context.plannedDuration}
- NEVER say things like "48 minutes" or "an hour" if the session is only ${context.plannedDuration} minutes
- Every number you use must make sense for a ${context.plannedDuration}-minute session

${sessionConstraint}

SESSION:
- Task: "${context.taskDescription}"
- Type: ${context.taskType}
- Duration: ${context.plannedDuration} min total
- Elapsed: ${context.elapsedMinutes} min
- Remaining: ${minutesLeft} min

${checkpointRules[context.checkpoint]}

${personalization}

BANNED PHRASES: "breather", "recharge", "you've got this", "great job", "keep it up", "stay strong", "you can do it", "power through"

TONE: Like a calm, focused friend who's working alongside you. Not a coach. Not an app.

Return ONLY this JSON (no other text):
{
  "message": "Your message here (6-12 words, no time values over ${context.plannedDuration})",
  "intent": "awareness | refocus | momentum | closure",
  "reasoning": "One sentence explaining why"
}`;
}

// ============================================
// PERSONALIZATION CONTEXT
// ============================================
function buildPersonalizationContext(context: {
  taskType: string;
  checkpoint: 'early' | 'mid' | 'late';
  focusHistory: {
    currentSession: Array<{
      checkpoint: string;
      focusState: string | null;
      driftReason: string | null;
      action: string | null;
    }>;
    pastSessions: {
      totalInterventions: number;
      commonDriftReasons: Array<{ reason: string; count: number }>;
      focusStateAtCheckpoints: Array<{ checkpoint: string; avgState: string }>;
      breakEffectiveness: { helped: number; somewhat: number; notReally: number };
    };
    patterns: string[];
  };
}): string {
  const { focusHistory, checkpoint, taskType } = context;
  const lines: string[] = [];

  lines.push('WHAT WE KNOW ABOUT THIS USER:');
  lines.push('(Use to personalize tone and content. Priority: current session > past trends > patterns)');

  if (focusHistory.currentSession.length > 0) {
    const last = focusHistory.currentSession.at(-1);
    if (last?.focusState) {
      lines.push(
        `- Earlier this session they reported: "${last.focusState}"${
          last.driftReason ? ` (reason: ${formatReason(last.driftReason)})` : ''
        }`
      );
      if (last.action) {
        lines.push(`- They ${last.action} the last intervention`);
      }
    }
  }

  if (focusHistory.pastSessions.totalInterventions > 0) {
    const past = focusHistory.pastSessions;

    if (past.commonDriftReasons.length > 0) {
      const topReason = past.commonDriftReasons[0];
      lines.push(
        `- Their #1 focus challenge during ${taskType}: ${formatReason(topReason.reason)} (${topReason.count} times)`
      );
    }

    const checkpointState = past.focusStateAtCheckpoints.find(
      c => c.checkpoint === checkpoint
    );
    if (checkpointState) {
      lines.push(`- At this point in similar sessions, they usually feel: "${checkpointState.avgState}"`);
    }

    const { helped, somewhat, notReally } = past.breakEffectiveness;
    const total = helped + somewhat + notReally;
    if (total >= 3) {
      if (notReally > helped) {
        lines.push('- Break suggestions have NOT worked well for them. Try a different approach.');
      } else if (helped > notReally) {
        lines.push('- Break suggestions have worked well for them in the past.');
      }
    }
  }

  if (focusHistory.patterns.length > 0) {
    lines.push(`- Known pattern: "${focusHistory.patterns[0]}"`);
  }

  if (lines.length <= 2) {
    lines.push('- New user, no history yet. Keep message simple and welcoming.');
  }

  return lines.join('\n');
}

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    mind_wandering: 'mind wandering',
    feeling_stuck: 'feeling stuck',
    tired: 'feeling tired',
    external: 'external distractions',
  };
  return map[reason] || reason;
}

// ============================================
// DASHBOARD INSIGHTS PROMPT
// ============================================
export function buildDashboardInsightsPrompt(sessions: Session[]): string {
  const sessionData = sessions.map(s => ({
    task_type: s.task_type,
    focus_quality: s.focus_quality,
    duration: s.actual_duration,
    planned: s.planned_duration,
    distractions: s.distraction_count,
    day: new Date(s.started_at).toLocaleDateString('en-US', { weekday: 'long' }),
    hour: new Date(s.started_at).getHours(),
  }));

  const totalSessions = sessionData.length;
  const avgFocus =
    sessionData.reduce((sum, s) => sum + (s.focus_quality || 0), 0) /
    Math.max(totalSessions, 1);
  const totalMinutes = sessionData.reduce((sum, s) => sum + (s.duration || 0), 0);

  return `Generate 2–3 concise dashboard insights that feel personal and data-driven.

SUMMARY:
- ${totalSessions} sessions
- ${totalMinutes} total minutes
- ${avgFocus.toFixed(1)} average focus

DATA:
${JSON.stringify(sessionData, null, 2)}

RULES:
- 12–20 words per insight
- Use real numbers from the data
- At least one comparison (task types, time of day, planned vs actual)
- Sound like a smart friend noticing patterns, not a corporate dashboard
- Be specific: "Your coding sessions at 10am average 8.2/10" not "You focus better in the morning"

Return ONLY a JSON array:
["Insight one.", "Insight two.", "Insight three."]`;
}