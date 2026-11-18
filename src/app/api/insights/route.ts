import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getInsightsData } from '@/lib/insights';

/** Focus Fingerprint for the signed-in user. ?tz= puts hours and days in their timezone. */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await getInsightsData(user.id, request.nextUrl.searchParams.get('tz')));
  } catch (error) {
    console.error('Error fetching focus fingerprint:', error);
    return NextResponse.json({ error: 'Failed to fetch focus fingerprint data' }, { status: 500 });
  }
}
