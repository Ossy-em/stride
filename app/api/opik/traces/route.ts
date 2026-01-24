import { NextResponse } from 'next/server';
import { getTraces, getTraceSummary } from '@/lib/opik';

export async function GET() {
  try {
    const traces = getTraces();
    const summary = getTraceSummary();

    return NextResponse.json({
      summary,
      traces: traces.slice(-50), // Last 50 traces
      totalTraces: traces.length,
    });
  } catch (error) {
    console.error('Error fetching traces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traces' },
      { status: 500 }
    );
  }
}