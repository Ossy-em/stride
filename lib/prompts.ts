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
      hour12: true,
    }),
  }));

  return `You are analyzing a user's real focus behavior based ONLY on the data provided.

Sessions (most recent first):
${JSON.stringify(sessionData, null, 2)}

Task types:
- "coding" = Development & Technical Work
- "writing" = Writing & Creative Work
- "reading" = Reading & Learning

Analyze and identify evidence-backed patterns.

QUESTIONS TO ANSWER:
1. When does focus drop? (time into session, time of day)
2. Which task types sustain focus best?
3. Optimal session length per task type
4. Triggers for distraction (fatigue, task switching, session length)

RULES:
- Do NOT invent patterns
- Patterns must be supported by at least 3 sessions
- If evidence is weak or mixed, lower confidence
- It is OK to say no strong patterns exist

Return ONLY this JSON structure:
{
  "patterns": [
    {
      "type": "session_length | time_of_day | task_type | distraction_trigger",
      "insight": "Specific observation grounded in the data",
      "confidence": 0.0-1.0,
      "evidence": {
        "supporting_sessions": 0,
        "contradicting_sessions": 0,
        "notes": "Brief justification using session data"
      }
    }
  ],
  "recommendations": [
    {
      "suggestion": "Concrete scheduling or session adjustment",
      "based_on": "Referenced pattern insight"
    }
  ],
  "data_quality": {
    "session_count": ${sessions.length},
    "reliability": "low | medium | high",
    "notes": "Explain uncertainty or inconsistencies if any"
  }
}

Be precise. Avoid generic productivity advice.`;
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

  const personalization = buildPersonalizationContext(context);

  const checkpointRules: Record<string, string> = {
    early: `CHECKPOINT: EARLY (${context.elapsedMinutes}/${context.plannedDuration} mins)

GOAL: Gentle awareness only.

RULES:
- DO NOT mention breaks
- DO NOT give time advice
- Just check in

Examples:
- "Quick check. How's it going?"
- "${context.elapsedMinutes} mins in. Still settling?"
- "Checking in. Locked in?"`,

    mid: `CHECKPOINT: MID (${context.elapsedMinutes}/${context.plannedDuration} mins, ${minutesLeft} left)

GOAL: Focus check without disruption.

RULES:
- DO NOT suggest long breaks
- Keep neutral and supportive

Examples:
- "Halfway through. Focus holding?"
- "${minutesLeft} mins left. How are you feeling?"
- "Midpoint check. Still on track?"`,

    late: `CHECKPOINT: LATE (${context.elapsedMinutes}/${context.plannedDuration} mins, ${minutesLeft} left)

GOAL: Encourage completion.

RULES:
- ${isShortSession ? 'DO NOT suggest breaks over 30 seconds.' : 'Short physical reset allowed.'}
- Keep suggestions brief

Examples:
- "Almost there. Roll your shoulders?"
- "${minutesLeft} mins left. Deep breath?"
- "Final stretch. Still good?"`,
  };

  return `You are generating a short focus intervention message.

SESSION:
- Task: "${context.taskDescription}"
- Duration: ${context.plannedDuration} minutes
- Elapsed: ${context.elapsedMinutes} minutes
- Remaining: ${minutesLeft} minutes
${isShortSession ? '- SHORT SESSION. Avoid breaks.\n' : ''}
${checkpointRules[context.checkpoint]}

INTERVENTION INTENT:
Choose ONE intent that fits best:
- awareness
- refocus
- momentum
- closure

ADAPTATION RULE:
- If similar past interventions were ineffective ("notReally"),
  avoid repeating the same style or suggestion.

${personalization}

FORMAT RULES:
- 8–15 words max
- Calm, human tone
- No corporate language
- Avoid: "breather", "recharge", "you've got this", "great job"
- Max 1 emoji if natural
- Do NOT mention specific break durations unless session ≥ 30 minutes

Return ONLY this JSON:
{
  "message": "Your message",
  "intent": "awareness | refocus | momentum | closure",
  "reasoning": "One sentence explaining why this intent fits now"
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

  lines.push('USER CONTEXT (for personalization):');
  lines.push('PRIORITY ORDER: current session > past checkpoint trends > long-term patterns');

  if (focusHistory.currentSession.length > 0) {
    const last = focusHistory.currentSession.at(-1);
    if (last?.focusState) {
      lines.push(
        `- Earlier this session: "${last.focusState}"${
          last.driftReason ? ` due to ${formatReason(last.driftReason)}` : ''
        }`
      );
    }
  }

  if (focusHistory.pastSessions.totalInterventions > 0) {
    const past = focusHistory.pastSessions;

    if (past.commonDriftReasons.length > 0) {
      lines.push(
        `- Common struggle during ${taskType}: ${formatReason(
          past.commonDriftReasons[0].reason
        )}`
      );
    }

    const checkpointState = past.focusStateAtCheckpoints.find(
      c => c.checkpoint === checkpoint
    );
    if (checkpointState) {
      lines.push(`- Usually feels "${checkpointState.avgState}" at this point`);
    }
  }

  if (focusHistory.patterns.length > 0) {
    lines.push(`- Known pattern: ${focusHistory.patterns[0]}`);
  }

  if (lines.length <= 2) {
    lines.push('- New user. Keep message simple.');
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

  return `Generate 2–3 concise dashboard insights.

SUMMARY:
- ${totalSessions} sessions
- ${totalMinutes} total minutes
- ${avgFocus.toFixed(1)} average focus

DATA:
${JSON.stringify(sessionData, null, 2)}

RULES:
- 12–20 words per insight
- Use real numbers
- At least one comparison (task types, time of day, planned vs actual)
- Curious tone, not preachy
- Avoid generic advice

Return ONLY a JSON array:
["Insight one.", "Insight two.", "Insight three."]`;
}
