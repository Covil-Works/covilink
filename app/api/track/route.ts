import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, linkTitle, url, type, visitorId } = body;

    const eventType = type === 'pageview' ? 'pageview' : 'click';

    if (eventType === 'click' && (!linkId || !url)) {
      return NextResponse.json({ error: 'linkId and url are required for click events' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);

    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    let browser = 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    if (userAgent.includes('Edge') || userAgent.includes('Edg/')) browser = 'Edge';

    const referrer = req.headers.get('referer') || 'Direto';

    const clickEvent = await trackClick({
      type: eventType,
      linkId: linkId || 'pageview',
      linkTitle: linkTitle || (eventType === 'pageview' ? 'Visualização do Perfil' : linkId || 'Link'),
      url: url || '/',
      device,
      browser,
      referrer,
      visitorId,
    });

    return NextResponse.json({ success: true, event: clickEvent });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
  }
}
