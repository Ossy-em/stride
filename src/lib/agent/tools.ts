/**
 * The Agent's tools. Every tool runs for ONE user (the signed-in one) and
 * only reads that user's own rows; the model never passes a user id.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "../supabase";
import { getUserPlan } from "../plans";
import { getFocusStats } from "../stats";
import { getInsightsData } from "../insights";
import { getGoalDetail, getGoalsData } from "../goals";

const DAY_MS = 864e5;
const iso = (t: string | null) => (t ? (/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`) : null);

export type ToolContext = { userId: string; tz: string };

/** "2026-10-18 14:05 Sun" in the user's timezone, so the model never does timezone maths. */
function localStamp(t: string | null, tz: string) {
  const at = iso(t);
  if (!at) return null;
  const d = new Date(at);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  return `${date} ${time} ${wd}`;
}

const TASK_TYPES: Record<string, string> = { coding: "Development", writing: "Writing", reading: "Learning" };

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_overview",
    description:
      "The user's headline numbers (already included in your context as verified facts; call again only to refresh): saved sessions, focus minutes and average rating for today, yesterday, this week since Monday, last week, the last 7 days, the last 30 days and all time; current and longest daily streak; first and last session; plan.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_sessions",
    description:
      "The user's focus sessions, newest first, with task, type, planned vs actual minutes, focus rating (1-10, self-rated at the end), distractions, nudges received and accepted, check-in answers, what they got done, and the goal it counted towards. Use for questions about specific days, tasks, recent work, or to back up a claim with examples.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "integer", minimum: 1, maximum: 365, description: "How many days back to look. Default 14." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max sessions to return. Default 30." },
        task_type: { type: "string", enum: ["coding", "writing", "reading"], description: "Only this kind of task." },
        goal_id: { type: "string", description: "Only sessions that counted towards this goal." },
      },
    },
  },
  {
    name: "get_insights",
    description:
      "The user's Focus Fingerprint, computed from all their saved sessions: peak focus hours, focus by hour and by day of week (scores 0-100, which is the 1-10 rating x10), the minute they typically drift and how often nudges help, growth from their first to recent sessions, and pattern discoveries. Needs at least 5 saved sessions.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_goals",
    description:
      "The user's weekly focus target with this week's progress by day, and all their goals (active and completed) with target hours, due date, focus time logged, sessions and steps done.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_goal",
    description: "One goal in detail: its steps (checklist) and every session that counted towards it. Get the id from get_goals.",
    input_schema: {
      type: "object",
      properties: { goal_id: { type: "string" } },
      required: ["goal_id"],
    },
  },
];

/** Shown in the chat while a tool runs. */
export const TOOL_LABELS: Record<string, string> = {
  get_overview: "Checking your activity",
  get_sessions: "Reading your sessions",
  get_insights: "Looking at your Focus Fingerprint",
  get_goals: "Checking your goals",
  get_goal: "Opening that goal",
};

/** The user's headline numbers, from the same module Home uses (lib/stats). */
export async function overview({ userId, tz }: ToolContext) {
  const { data: rows, error } = await supabaseAdmin
    .from("sessions")
    .select("started_at, actual_duration, focus_quality")
    .eq("user_id", userId)
    .not("focus_quality", "is", null);
  if (error) throw error;
  const st = getFocusStats(rows || [], tz);
  const block = (b: { sessions: number; focusMinutes: number; avgRating: number | null }) => ({
    saved_sessions: b.sessions,
    focus_minutes: b.focusMinutes,
    avg_focus_rating: b.avgRating,
  });
  return {
    plan: await getUserPlan(userId),
    today: block(st.today),
    yesterday: block(st.yesterday),
    this_week_since_monday: block(st.thisWeek),
    last_week_monday_to_sunday: block(st.lastWeek),
    last_7_days: block(st.last7Days),
    last_30_days: block(st.last30Days),
    all_time: block(st.allTime),
    streak_days: { current: st.streak.current, longest: st.streak.longest, at_risk_today: st.streak.atRisk },
    first_session: localStamp(st.firstSessionAt, tz),
    last_session: localStamp(st.lastSessionAt, tz),
  };
}

async function sessions(ctx: ToolContext, input: Record<string, unknown>) {
  const days = Math.min(Math.max(Number(input.days) || 14, 1), 365);
  const limit = Math.min(Math.max(Number(input.limit) || 30, 1), 100);
  let q = supabaseAdmin
    .from("sessions")
    .select("id, task_description, task_type, planned_duration, actual_duration, focus_quality, distraction_count, outcome, started_at, ended_at, goal_id")
    .eq("user_id", ctx.userId)
    .gte("started_at", new Date(Date.now() - days * DAY_MS).toISOString())
    .order("started_at", { ascending: false })
    .limit(limit);
  if (typeof input.task_type === "string") q = q.eq("task_type", input.task_type);
  if (typeof input.goal_id === "string") q = q.eq("goal_id", input.goal_id);
  let { data: rows, error } = await q;
  // goal_id may not exist yet if Goals SQL wasn't run; retry without it
  if (error && /goal_id/.test(error.message || "")) {
    ({ data: rows, error } = await supabaseAdmin
      .from("sessions")
      .select("id, task_description, task_type, planned_duration, actual_duration, focus_quality, distraction_count, outcome, started_at, ended_at")
      .eq("user_id", ctx.userId)
      .gte("started_at", new Date(Date.now() - days * DAY_MS).toISOString())
      .order("started_at", { ascending: false })
      .limit(limit) as any);
  }
  if (error) throw error;
  const list = (rows || []) as any[];
  const ids = list.map((r) => r.id);

  const [ivs, cks, goals] = await Promise.all([
    ids.length ? supabaseAdmin.from("interventions").select("session_id, user_action").in("session_id", ids) : { data: [] },
    ids.length ? supabaseAdmin.from("checkins").select("session_id, response").in("session_id", ids) : { data: [] },
    supabaseAdmin.from("goals").select("id, title").eq("user_id", ctx.userId),
  ]);
  const nudges = new Map<string, { total: number; accepted: number }>();
  for (const iv of (ivs.data || []) as any[]) {
    const n = nudges.get(iv.session_id) || { total: 0, accepted: 0 };
    n.total++;
    if (iv.user_action === "accepted") n.accepted++;
    nudges.set(iv.session_id, n);
  }
  const checkins = new Map<string, string[]>();
  for (const c of (cks.data || []) as any[]) checkins.set(c.session_id, [...(checkins.get(c.session_id) || []), c.response]);
  const goalTitle = new Map(((goals as any).data || []).map((g: any) => [g.id, g.title]));

  return {
    days,
    count: list.length,
    sessions: list.map((r) => ({
      started: localStamp(r.started_at, ctx.tz),
      task: r.task_description,
      type: TASK_TYPES[r.task_type] ?? r.task_type,
      planned_minutes: r.planned_duration,
      focused_minutes: r.actual_duration,
      focus_rating: r.focus_quality,
      distractions: r.distraction_count,
      nudges: nudges.get(r.id) ?? { total: 0, accepted: 0 },
      checkins: checkins.get(r.id) ?? [],
      got_done: r.outcome || null,
      goal: r.goal_id ? goalTitle.get(r.goal_id) ?? null : null,
      status: r.focus_quality !== null ? "saved" : r.ended_at ? "not saved" : "in progress or abandoned",
    })),
  };
}

export async function runTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  switch (name) {
    case "get_overview":
      return overview(ctx);
    case "get_sessions":
      return sessions(ctx, input);
    case "get_insights":
      return getInsightsData(ctx.userId, ctx.tz);
    case "get_goals":
      try {
        return await getGoalsData(ctx.userId, ctx.tz);
      } catch {
        return { note: "Goals aren't set up for this account yet." };
      }
    case "get_goal": {
      const id = String(input.goal_id || "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Unknown goal id. Call get_goals for the ids." };
      const detail = await getGoalDetail(ctx.userId, id);
      if (!detail) return { error: "No goal with that id for this user." };
      return { ...detail, sessions: detail.sessions.slice(0, 40).map((s) => ({ ...s, startedAt: localStamp(s.startedAt, ctx.tz) })) };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}
