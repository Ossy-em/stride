import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EndSessionModal from '@/components/EndSessionModal';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EndSessionPage({ searchParams }: PageProps) {
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

  // Check if session already ended
  if (session.ended_at) {
    redirect('/dashboard');
  }

  // Calculate elapsed time
  const startTime = new Date(session.started_at).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.round((now - startTime) / 1000 / 60);

  return (
    <EndSessionModal
      sessionId={session.id}
      taskDescription={session.task_description}
      elapsedMinutes={elapsedMinutes}
    />
  );
}