import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, linkTitle, url } = body;

    if (!linkId || !url) {
      return NextResponse.json({ error: 'linkId and url are required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);

    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    let browser = 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    if (userAgent.includes('Firefox')) browser = 'Firefox';

    const referrer = req.headers.get('referer') || 'Direto / Rede Social';

    const clickEvent = await trackClick({
      linkId,
      linkTitle: linkTitle || linkId,
      url,
      device,
      browser,
      referrer,
    });

    return NextResponse.json({ success: true, event: clickEvent });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to record click metric' }, { status: 500 });
  }
}
