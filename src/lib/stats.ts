/**
 * The one definition of Stride's activity numbers. Home and the Agent both
 * use this, so "this week", "today" and the streak always agree.
 *
 * Rules:
 * - Only saved sessions count (focus_quality set at the end).
 * - Times are stored in UTC; dates and hours are worked out in the user's timezone.
 * - "This week" starts Monday 00:00 in the user's timezone (same as Goals).
 * - Streak = consecutive days with at least one saved session, ending today,
 *   or ending yesterday if there's nothing yet today.
 */
import { getStartOfDayInTimezone } from "./plans";

const DAY_MS = 864e5;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Supabase returns timestamps without a zone; they are UTC. */
export const asUtc = (t: string | null | undefined) =>
  t ? (/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`) : null;

export function safeZone(tz?: string | null) {
  try {
    if (tz) {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    }
  } catch {}
  return "UTC";
}

export const localDay = (t: string | Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    typeof t === "string" ? new Date(asUtc(t)!) : t
  );

type Row = { started_at: string; actual_duration: number | null; focus_quality: number | null };

export function getFocusStats<T extends Row>(rows: T[], tzIn?: string | null) {
  const tz = safeZone(tzIn);
  const saved = rows
    .filter((r) => r.focus_quality !== null && r.focus_quality !== undefined)
    .map((r) => ({ ...r, at: Date.parse(asUtc(r.started_at)!) }))
    .sort((a, b) => a.at - b.at);

  const todayStart = Date.parse(getStartOfDayInTimezone(tz));
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date());
  const weekStart = todayStart - Math.max(WEEKDAYS.indexOf(weekday), 0) * DAY_MS;

  const between = (from: number, to = Infinity) => saved.filter((s) => s.at >= from && s.at < to);
  const sum = (list: typeof saved) => ({
    sessions: list.length,
    focusMinutes: list.reduce((n, s) => n + (s.actual_duration || 0), 0),
    avgRating: list.length ? Math.round((list.reduce((n, s) => n + (s.focus_quality || 0), 0) / list.length) * 10) / 10 : null,
  });

  // streak
  const days = new Set(saved.map((s) => localDay(new Date(s.at), tz)));
  const dayKey = (offset: number) => localDay(new Date(todayStart + 12 * 36e5 - offset * DAY_MS), tz);
  const hasToday = days.has(dayKey(0));
  let current = 0;
  const from = hasToday ? 0 : 1;
  while (days.has(dayKey(from + current))) current++;
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of [...days].sort()) {
    const t = Date.parse(`${d}T00:00:00Z`);
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }

  return {
    tz,
    todayStart,
    weekStart,
    today: sum(between(todayStart)),
    yesterday: sum(between(todayStart - DAY_MS, todayStart)),
    thisWeek: sum(between(weekStart)),
    lastWeek: sum(between(weekStart - 7 * DAY_MS, weekStart)),
    last7Days: sum(between(todayStart - 6 * DAY_MS)),
    last30Days: sum(between(todayStart - 29 * DAY_MS)),
    allTime: sum(saved),
    streak: { current, longest, atRisk: !hasToday && current > 0 },
    firstSessionAt: saved[0] ? new Date(saved[0].at).toISOString() : null,
    lastSessionAt: saved.length ? new Date(saved[saved.length - 1].at).toISOString() : null,
  };
}
