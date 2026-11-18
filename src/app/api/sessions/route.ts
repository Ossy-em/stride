import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { SessionHistoryItem, SessionHistoryResponse } from "@/types";

const RANGES = { "7d": 7, "30d": 30, all: null } as const;
type Range = keyof typeof RANGES;

// started_at is stored without a zone in older rows; treat it as UTC
const iso = (t: string | null) => (t ? (/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`) : null);

// A session nobody ended within 12h of its planned length is treated as abandoned.
const STALE_MS = 12 * 60 * 60 * 1000;

/** GET /api/sessions?range=7d|30d|all  The signed-in user's session history, newest first. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asked = (request.nextUrl.searchParams.get("range") || "30d") as Range;
  const range: Range = asked in RANGES ? asked : "30d";

  // Full history on every plan.
  const days = RANGES[range];

  try {
    let query = supabaseAdmin
      .from("sessions")
      .select(
        "id, task_description, task_type, planned_duration, actual_duration, focus_quality, distraction_count, outcome, started_at, ended_at"
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(500);
    if (days) query = query.gte("started_at", new Date(Date.now() - days * 864e5).toISOString());

    const { data: rows, error } = await query;
    if (error) throw error;

    const ids = (rows || []).map((r) => r.id);
    const nudges = new Map<string, { total: number; accepted: number }>();
    if (ids.length) {
      const { data: ivs } = await supabaseAdmin
        .from("interventions")
        .select("session_id, user_action")
        .in("session_id", ids);
      for (const iv of ivs || []) {
        const n = nudges.get(iv.session_id) || { total: 0, accepted: 0 };
        n.total += 1;
        if (iv.user_action === "accepted") n.accepted += 1;
        nudges.set(iv.session_id, n);
      }
    }

    const now = Date.now();
    const sessions: SessionHistoryItem[] = (rows || []).map((r) => {
      const startedAt = iso(r.started_at)!;
      const endedAt = iso(r.ended_at);
      const stale = now - Date.parse(startedAt) > (r.planned_duration || 0) * 60e3 + STALE_MS;
      const status =
        r.focus_quality !== null ? "completed" : !endedAt && !stale ? "in_progress" : "unsaved";
      const n = nudges.get(r.id) || { total: 0, accepted: 0 };
      return {
        id: r.id,
        task: r.task_description,
        taskType: r.task_type,
        plannedMinutes: r.planned_duration,
        actualMinutes: r.actual_duration,
        focusQuality: r.focus_quality,
        distractions: r.distraction_count,
        outcome: r.outcome || null,
        startedAt,
        endedAt,
        nudges: n.total,
        nudgesAccepted: n.accepted,
        status,
      };
    });

    const body: SessionHistoryResponse = { range, sessions };
    return NextResponse.json(body);
  } catch (e) {
    console.error("Error fetching sessions:", e);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
