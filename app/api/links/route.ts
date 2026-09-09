import { NextRequest, NextResponse } from 'next/server';
import { getLinks, saveLinks } from '@/lib/links-store';
import { INITIAL_LINKS } from '@/lib/links-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await getLinks();
    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    return NextResponse.json({ success: false, links: INITIAL_LINKS }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, links } = body;

    if (action === 'reset') {
      const saved = await saveLinks(INITIAL_LINKS);
      return NextResponse.json({ success: true, links: saved });
    }

    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid links payload: expected array', links: await getLinks() }, { status: 400 });
    }

    const saved = await saveLinks(links);
    return NextResponse.json({ success: true, links: saved });
  } catch (error) {
    console.error('Error in POST /api/links:', error);
    return NextResponse.json({ error: 'Failed to save links configuration', links: await getLinks() }, { status: 500 });
  }
}
