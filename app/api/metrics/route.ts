import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, resetAnalyticsData } from '@/lib/analytics';

export async function GET() {
  try {
    const metrics = await getAnalyticsSummary();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
