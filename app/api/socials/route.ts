import { NextRequest, NextResponse } from 'next/server';
import { getSocials, saveSocials } from '@/lib/socials-store';
import { INITIAL_SOCIALS } from '@/lib/links-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const socials = await getSocials();
    return NextResponse.json({ success: true, socials });
  } catch (error) {
    console.error('Error in GET /api/socials:', error);
    return NextResponse.json({ success: false, socials: INITIAL_SOCIALS }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, socials } = body;

    if (action === 'reset') {
      const saved = await saveSocials(INITIAL_SOCIALS);
      return NextResponse.json({ success: true, socials: saved });
    }

    if (!Array.isArray(socials)) {
      return NextResponse.json({ error: 'Invalid socials payload: expected array', socials: await getSocials() }, { status: 400 });
    }

    const saved = await saveSocials(socials);
    return NextResponse.json({ success: true, socials: saved });
  } catch (error) {
    console.error('Error in POST /api/socials:', error);
    return NextResponse.json({ error: 'Failed to save socials configuration', socials: await getSocials() }, { status: 500 });
  }
}
