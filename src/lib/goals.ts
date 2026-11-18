/**
 * Goals data: the weekly target and named goals, with focus time from
 * saved sessions. Used by /api/goals and (later) the Agent's tools.
 */
import { supabaseAdmin } from "./supabase";
import { getStartOfDayInTimezone } from "./plans";
import type { Goal, GoalDetail, GoalsResponse } from "@/types";

const DAY_MS = 864e5;
const iso = (t: string | null) => (t ? (/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`) : null);

function zone(tz?: string | null) {
  try {
    if (tz) {
      new Intl.DateTimeFormat("en-CA", { timeZone: tz });
      return tz;
    }
  } catch {}
  return "UTC";
}
const ymdIn = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const mondayIndex = (d: Date, tz: string) =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d)
  );

/** Is the table missing? (scripts/add-goals.sql not run yet) */
export const isMissingTable = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "42703" || (/goal|weekly_target|goal_steps/i.test(e.message || "") && /does not exist/i.test(e.message || "")));

export async function getGoalsData(userId: string, tzIn?: string | null): Promise<GoalsResponse> {
  const tz = zone(tzIn);
  const now = new Date();
  const todayStart = Date.parse(getStartOfDayInTimezone(tz));
  const weekStart = todayStart - Math.max(mondayIndex(now, tz), 0) * DAY_MS;
  const days = Array.from({ length: 7 }, (_, i) => ymdIn(new Date(weekStart + i * DAY_MS + 12 * 36e5), tz));

  const [userRes, goalsRes, weekRes] = await Promise.all([
    supabaseAdmin.from("users").select("weekly_target_minutes").eq("id", userId).single(),
    supabaseAdmin
      .from("goals")
      .select("id, title, target_minutes, due_date, status, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("sessions")
      .select("actual_duration, started_at")
      .eq("user_id", userId)
      .not("focus_quality", "is", null)
      .gte("started_at", new Date(weekStart).toISOString()),
  ]);
  if (goalsRes.error) throw goalsRes.error;
  if (userRes.error) throw userRes.error;
  if (weekRes.error) throw weekRes.error;

  const byDay = new Map(days.map((d) => [d, 0]));
  let weekMinutes = 0;
  for (const s of weekRes.data || []) {
    const m = s.actual_duration || 0;
    const key = ymdIn(new Date(iso(s.started_at)!), tz);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + m);
    weekMinutes += m;
  }

  const rows = goalsRes.data || [];
  const stats = new Map<string, { minutes: number; sessions: number; last: string | null }>();
  if (rows.length) {
    const { data: linked, error } = await supabaseAdmin
      .from("sessions")
      .select("goal_id, actual_duration, started_at")
      .eq("user_id", userId)
      .not("focus_quality", "is", null)
      .in("goal_id", rows.map((g) => g.id));
    if (error) throw error;
    for (const s of linked || []) {
      const st = stats.get(s.goal_id) || { minutes: 0, sessions: 0, last: null };
      st.minutes += s.actual_duration || 0;
      st.sessions += 1;
      const at = iso(s.started_at);
      if (at && (!st.last || at > st.last)) st.last = at;
      stats.set(s.goal_id, st);
    }
  }

  const steps = new Map<string, { done: number; total: number }>();
  if (rows.length) {
    // goal_steps may not exist yet (add-goal-steps.sql); goals still load without it
    const { data: stepRows, error } = await supabaseAdmin
      .from("goal_steps")
      .select("goal_id, done")
      .in("goal_id", rows.map((g) => g.id));
    if (error && !isMissingTable(error)) throw error;
    for (const r of stepRows || []) {
      const c = steps.get(r.goal_id) || { done: 0, total: 0 };
      c.total += 1;
      if (r.done) c.done += 1;
      steps.set(r.goal_id, c);
    }
  }

  const goals: Goal[] = rows.map((g) => {
    const st = stats.get(g.id);
    const sc = steps.get(g.id);
    return {
      id: g.id,
      title: g.title,
      targetMinutes: g.target_minutes,
      dueDate: g.due_date,
      status: g.status,
      createdAt: iso(g.created_at)!,
      completedAt: iso(g.completed_at),
      minutes: st?.minutes ?? 0,
      sessions: st?.sessions ?? 0,
      lastSessionAt: st?.last ?? null,
      stepsDone: sc?.done ?? 0,
      stepsTotal: sc?.total ?? 0,
    };
  });

  return {
    week: {
      targetMinutes: userRes.data?.weekly_target_minutes ?? null,
      minutes: weekMinutes,
      sessions: weekRes.data?.length ?? 0,
      days: days.map((date) => ({ date, minutes: byDay.get(date) || 0 })),
    },
    goals,
  };
}

/** One goal with its steps and the sessions that counted towards it. null = not this user's goal. */
export async function getGoalDetail(userId: string, goalId: string): Promise<GoalDetail | null> {
  const { data: g, error } = await supabaseAdmin
    .from("goals")
    .select("id, title, target_minutes, due_date, status, created_at, completed_at")
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!g) return null;

  const [sessRes, stepRes] = await Promise.all([
    supabaseAdmin
      .from("sessions")
      .select("id, task_description, started_at, actual_duration, focus_quality")
      .eq("user_id", userId)
      .eq("goal_id", goalId)
      .not("focus_quality", "is", null)
      .order("started_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("goal_steps")
      .select("id, title, done, position, created_at")
      .eq("goal_id", goalId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);
  if (sessRes.error) throw sessRes.error;
  if (stepRes.error && !isMissingTable(stepRes.error)) throw stepRes.error;

  const sessions = (sessRes.data || []).map((s) => ({
    id: s.id,
    task: s.task_description,
    startedAt: iso(s.started_at)!,
    minutes: s.actual_duration || 0,
    focusQuality: s.focus_quality,
  }));
  const steps = (stepRes.data || []).map((s) => ({ id: s.id, title: s.title, done: s.done, position: s.position }));

  return {
    goal: {
      id: g.id,
      title: g.title,
      targetMinutes: g.target_minutes,
      dueDate: g.due_date,
      status: g.status,
      createdAt: iso(g.created_at)!,
      completedAt: iso(g.completed_at),
      minutes: sessions.reduce((t, s) => t + s.minutes, 0),
      sessions: sessions.length,
      lastSessionAt: sessions[0]?.startedAt ?? null,
      stepsDone: steps.filter((s) => s.done).length,
      stepsTotal: steps.length,
    },
    steps,
    sessions,
  };
}

/** Is this goal the user's? Used before touching its steps. */
export async function ownsGoal(userId: string, goalId: string) {
  const { data } = await supabaseAdmin.from("goals").select("id").eq("id", goalId).eq("user_id", userId).maybeSingle();
  return !!data;
}
