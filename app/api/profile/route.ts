import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/profile-store';
import { INITIAL_PROFILE } from '@/lib/links-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json({ success: false, profile: INITIAL_PROFILE }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, profile } = body;

    if (action === 'reset') {
      const saved = await saveProfile(INITIAL_PROFILE);
      return NextResponse.json({ success: true, profile: saved });
    }

    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'Invalid profile payload', profile: await getProfile() }, { status: 400 });
    }

    const saved = await saveProfile(profile);
    return NextResponse.json({ success: true, profile: saved });
  } catch (error) {
    console.error('Error in POST /api/profile:', error);
    return NextResponse.json({ error: 'Failed to save profile configuration', profile: await getProfile() }, { status: 500 });
  }
}
