import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/plans";
import FocusFrame from "@/components/app/focus-frame";
import FocusTimer, { type TrackEvent } from "@/components/app/session/focus-timer";

const utc = (t: string) => Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`);

/**
 * Timeline marks from what's saved: nudges (interventions.triggered_at) and
 * answered check-ins (checkins.timestamp), placed by time since start and
 * capped at the time focused so far. Pauses before a mark can shift it a
 * little; the browser's own copy (see FocusTimer) is exact.
 */
async function rebuildMarks(session: {
  id: string;
  started_at: string;
  total_paused_ms?: number | null;
  paused_at?: string | null;
}): Promise<TrackEvent[]> {
  try {
    const start = utc(session.started_at);
    const now = Date.now();
    const pausedNow = session.paused_at ? now - utc(session.paused_at) : 0;
    const focused = Math.max(0, (now - start - (session.total_paused_ms || 0) - pausedNow) / 1000);
    const [{ data: nudges }, { data: checks }] = await Promise.all([
      supabaseAdmin.from("interventions").select("triggered_at").eq("session_id", session.id),
      supabaseAdmin.from("checkins").select("timestamp").eq("session_id", session.id),
    ]);
    const at = (t: string) => Math.round(Math.min(Math.max((utc(t) - start) / 1000, 0), focused));
    return [
      ...(nudges || []).filter((n) => n.triggered_at).map((n) => ({ at: at(n.triggered_at), kind: "nudge" as const })),
      ...(checks || []).filter((c) => c.timestamp).map((c) => ({ at: at(c.timestamp), kind: "check" as const })),
    ].sort((a, b) => a.at - b.at);
  } catch {
    return [];
  }
}

export const metadata: Metadata = { title: "Focus", robots: { index: false, follow: false } };

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ActiveSessionPage({ searchParams }: PageProps) {
  const { id: sessionId } = await searchParams;
  if (!sessionId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/session/active?id=${sessionId}`)}`);

  const { data: session, error } = await supabaseAdmin.from("sessions").select("*").eq("id", sessionId).single();
  if (error || !session) {
    console.error("Session fetch error:", error);
    notFound();
  }
  // only the owner sees their timer; a finished session lives in Sessions
  if (session.user_id !== user.id) notFound();
  if (session.ended_at) redirect("/sessions");

  const plan = await getUserPlan(user.id).catch(() => "free" as const);
  const initialEvents = await rebuildMarks(session);

  return (
    <FocusFrame plan={plan}>
      <FocusTimer
        sessionId={session.id}
        taskDescription={session.task_description}
        plannedDuration={session.planned_duration}
        startedAt={session.started_at}
        initialEvents={initialEvents}
      />
    </FocusFrame>
  );
}
