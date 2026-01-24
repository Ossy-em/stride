import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const respondSchema = z.object({
  interventionId: z.string().uuid(),
  action: z.enum(['accepted', 'dismissed', 'ignored']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interventionId, action } = respondSchema.parse(body);
    // Fetch intervention to verify it exists
    const { data: intervention, error: fetchError } = await supabase
      .from('interventions')
      .select('session_id')
      .eq('id', interventionId)
      .single();

    if (fetchError || !intervention) {
      console.error('Failed to fetch intervention:', fetchError);
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    // Get the most recent check-in BEFORE this intervention to capture "before" state
    const { data: recentCheckin } = await supabase
      .from('checkins')
      .select('response')
      .eq('session_id', intervention.session_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Update intervention with user action and "before" focus state
    const { error } = await supabase
      .from('interventions')
      .update({
        user_action: action,
        // Store metadata for later effectiveness calculation
        metadata: {
          focus_before: recentCheckin?.response || 'neutral'
        }
      })
      .eq('id', interventionId);

    if (error) {
      console.error('Failed to update intervention:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    console.log(`📝 Intervention ${interventionId}: User ${action} (focus_before: ${recentCheckin?.response || 'neutral'})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording response:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}