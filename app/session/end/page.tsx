import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import SessionComplete from '@/components/session/SessionComplete';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EndSessionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.id;

  if (!sessionId) {
    notFound();
  }

  // Auth check - prevent unauthorized access
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch session details
  const { data: session, error } = await supabase
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
    redirect('/dashboard');
  }

  // Calculate elapsed time
  const startTime = new Date(session.started_at + 'Z').getTime();
  const now = new Date().getTime();
  const elapsedMs = now - startTime;
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 1000 / 60));

  // Optionally fetch streak info for display
  // This is a simplified version - you can enhance this
  let currentStreak = 0;
  try {
    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('started_at')
      .eq('user_id', session.user_id)
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: false })
      .limit(30);

    if (recentSessions && recentSessions.length > 0) {
      // Simple streak calculation
      const sessionDates = new Set(
        recentSessions.map((s) => {
          const d = new Date(s.started_at);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );

      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

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

  return (
    <SessionComplete
      sessionId={session.id}
      taskDescription={session.task_description}
      elapsedMinutes={elapsedMinutes}
      currentStreak={currentStreak}
    />
  );
}