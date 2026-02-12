import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ActiveTimer from '@/components/session/ActiveTimer';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ActiveSessionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.id;

  if (!sessionId) {
    notFound();
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

 return (
  <ActiveTimer
    sessionId={session.id}
    taskDescription={session.task_description}
    plannedDuration={session.planned_duration}
    startedAt={session.started_at}
  />
);
}