import { NextRequest, NextResponse } from 'next/server';
import { getTraces, getTraceSummary } from '../../../../lib/opik';
import { safeEqual } from '../../../../lib/security';

/** AI call traces. They include session details, so admin password only. */
export async function GET(request: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !safeEqual(request.headers.get('x-admin-password'), pw)) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  try {
    const traces = getTraces();
    const summary = getTraceSummary();
    return NextResponse.json({ summary, traces: traces.slice(-50), totalTraces: traces.length });
  } catch (error) {
    console.error('Error fetching traces:', error);
    return NextResponse.json({ error: 'Failed to fetch traces' }, { status: 500 });
  }
}
