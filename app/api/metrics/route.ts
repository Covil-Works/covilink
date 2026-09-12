import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, resetAnalyticsData } from '@/lib/analytics';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const metrics = await getAnalyticsSummary();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { action } = await req.json();
    if (action === 'reset') {
      resetAnalyticsData();
      const updated = await getAnalyticsSummary();
      return NextResponse.json({ success: true, metrics: updated });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform analytics action' }, { status: 500 });
  }
}
