/**
 * Weekly review: last week (Monday to Sunday, user's timezone) in numbers,
 * plus a short summary the Agent writes from those numbers only. The summary
 * goes through the same fact check as Agent answers, then is cached in
 * weekly_reviews so it's written once per user per week.
 * Server-only.
 */
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase";
import { asUtc, getFocusStats, localDay, safeZone } from "./stats";
import { factCheck, tidy } from "./agent/check";

const DAY_MS = 864e5;
const MODEL = process.env.AGENT_MODEL || "claude-sonnet-5";
let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

export type WeeklyStats = {
  weekStart: string; // yyyy-mm-dd, Monday
  weekEnd: string; // yyyy-mm-dd, Sunday
  sessions: number;
  minutes: number;
  avgRating: number | null;
  prevSessions: number;
  prevMinutes: number;
  bestDay: { day: string; minutes: number } | null;
  activeDays: number;
  goalsCompleted: string[];
};
export type WeeklyReview = { stats: WeeklyStats; summary: string | null };

const missing = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "42703" || /does not exist/i.test(e.message || ""));

async function buildStats(userId: string, tz: string): Promise<WeeklyStats | null> {
  const since = new Date(Date.now() - 22 * DAY_MS).toISOString();
  const { data: rows, error } = await supabaseAdmin
    .from("sessions")
    .select("started_at, actual_duration, focus_quality")
    .eq("user_id", userId)
    .not("focus_quality", "is", null)
    .gte("started_at", since);
  if (error) throw error;

  const st = getFocusStats(rows || [], tz);
  if (!st.lastWeek.sessions) return null;

  const start = st.weekStart - 7 * DAY_MS;
  const ymd = (t: number) => localDay(new Date(t + 12 * 36e5), tz); // midday avoids DST edges
  const prev = (rows || []).filter((r) => {
    const t = Date.parse(asUtc(r.started_at)!);
    return t >= start - 7 * DAY_MS && t < start;
  });

  // per-day minutes last week
  const perDay = new Map<string, number>();
  for (const r of rows || []) {
    const t = Date.parse(asUtc(r.started_at)!);
    if (t < start || t >= st.weekStart) continue;
    const day = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" }).format(new Date(t));
    perDay.set(day, (perDay.get(day) || 0) + (r.actual_duration || 0));
  }
  const best = [...perDay.entries()].sort((a, b) => b[1] - a[1])[0];

  // goals ticked off last week (Goals SQL may not be run yet)
  let goalsCompleted: string[] = [];
  const { data: goals, error: gErr } = await supabaseAdmin
    .from("goals")
    .select("title, completed_at")
    .eq("user_id", userId)
    .gte("completed_at", new Date(start).toISOString())
    .lt("completed_at", new Date(st.weekStart).toISOString());
  if (!gErr) goalsCompleted = (goals || []).map((g) => g.title);
  else if (!missing(gErr)) console.error("weekly: goals", gErr.message);

  return {
    weekStart: ymd(start),
    weekEnd: ymd(st.weekStart - DAY_MS),
    sessions: st.lastWeek.sessions,
    minutes: st.lastWeek.focusMinutes,
    avgRating: st.lastWeek.avgRating,
    prevSessions: prev.length,
    prevMinutes: prev.reduce((n, r) => n + (r.actual_duration || 0), 0),
    bestDay: best ? { day: best[0], minutes: best[1] } : null,
    activeDays: perDay.size,
    goalsCompleted,
  };
}

const SYSTEM = `You write the weekly review on the Home screen of Stride, a focus coach app.
You get last week's numbers as JSON. Write 2 or 3 short sentences to the user ("you"):
what the week looked like, one thing that stands out (compare with the week before when it helps), and one simple thing to try this week.
Rules: use only numbers in the JSON, never invent any. Focus ratings are out of 10. Minutes over 60 read better as hours and minutes.
Plain text, no markdown, no lists, no emoji, no greetings, no dashes of any kind between clauses. Warm, direct, casual.`;

async function writeSummary(stats: WeeklyStats): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const data = JSON.stringify(stats);
  try {
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{ role: "user", content: data }],
    });
    const text = res.content.find((b) => b.type === "text");
    let out = (text && text.type === "text" ? text.text : "").trim();
    if (!out) return null;
    const check = await factCheck({
      client: anthropic(),
      model: MODEL,
      question: "Summarise my last week.",
      answer: out,
      evidence: [data],
    });
    if (!check.ok && check.corrected) out = check.corrected;
    return tidy(out);
  } catch (e) {
    console.error("weekly: summary failed", e);
    return null;
  }
}

export async function getWeeklyReview(userId: string, tzIn?: string | null): Promise<WeeklyReview | null> {
  const tz = safeZone(tzIn);
  const stats = await buildStats(userId, tz);
  if (!stats) return null;

  const { data: cached, error } = await supabaseAdmin
    .from("weekly_reviews")
    .select("stats, summary")
    .eq("user_id", userId)
    .eq("week_start", stats.weekStart)
    .maybeSingle();

  // table not created yet: show the numbers only, don't spend a model call on every visit
  if (error) {
    if (!missing(error)) console.error("weekly: read", error.message);
    return { stats, summary: null };
  }
  if (cached?.summary) return { stats: cached.stats as WeeklyStats, summary: cached.summary };

  const summary = await writeSummary(stats);
  if (summary) {
    const { error: wErr } = await supabaseAdmin
      .from("weekly_reviews")
      .upsert({ user_id: userId, week_start: stats.weekStart, stats, summary });
    if (wErr) console.error("weekly: save", wErr.message);
  }
  return { stats, summary };
}
