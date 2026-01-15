import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ActiveTimer from '@/components/ActiveTimer';

export default async function ActiveSessionPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const sessionId = searchParams.id;

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
    notFound();
  }

  return (
    <ActiveTimer
      sessionId={session.id}
      taskDescription={session.task_description}
      plannedDuration={session.planned_duration}
    />
  );
}