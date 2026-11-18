import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';
import SessionDone from '@/components/app/session/session-done';
import FocusFrame from '@/components/app/focus-frame';
import { getUserPlan } from '@/lib/plans';

export const metadata: Metadata = { title: "Session complete", robots: { index: false, follow: false } };

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EndSessionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.id;

  if (!sessionId) {
    notFound();
  }

  // Auth check
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch session details
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    console.error('Session fetch error:', error);
    notFound();
  }

  // Verify session ownership
  if (session.user_id !== user.id) {
    notFound();
  }

  // Check if session already ended
  if (session.ended_at) {
    redirect('/home');
  }

  // If session is currently paused, account for the final pause duration
  let totalPausedMs = session.total_paused_ms || 0;
  if (session.paused_at) {
    const pausedAt = new Date(session.paused_at).getTime();
    const finalPauseDuration = Date.now() - pausedAt;
    totalPausedMs += finalPauseDuration;
  }

  // Mark session as ended (and clear pause state)
  await supabaseAdmin
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      paused_at: null,
      total_paused_ms: totalPausedMs,
    })
    .eq('id', sessionId);

  // Calculate elapsed time, subtracting paused time
  const startTime = new Date(session.started_at + 'Z').getTime();
  const now = Date.now();
  const elapsedMs = now - startTime - totalPausedMs;
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 1000 / 60));

  // Fetch streak info
  let currentStreak = 0;
  try {
    const { data: recentSessions } = await supabaseAdmin
      .from('sessions')
      .select('started_at')
      .eq('user_id', session.user_id)
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: false })
      .limit(30);

    if (recentSessions && recentSessions.length > 0) {
      const sessionDates = new Set(
        recentSessions.map((s) => {
          const d = new Date(s.started_at);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );

      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
        if (sessionDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching streak:', e);
  }

  const plan = await getUserPlan(user.id).catch(() => 'free' as const);

  return (
    <FocusFrame plan={plan}>
      <SessionDone
        sessionId={session.id}
        taskDescription={session.task_description}
        elapsedMinutes={elapsedMinutes}
        currentStreak={currentStreak}
      />
    </FocusFrame>
  );
}