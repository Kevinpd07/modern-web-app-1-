import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: { 
        id: session.user_id, 
        username: session.username 
      } 
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
