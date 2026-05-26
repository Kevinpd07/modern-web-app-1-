import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByUsername, verifyPassword, createSession } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(user, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const session = createSession(randomUUID(), user.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    const cookieStore = await cookies();
    cookieStore.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !!process.env.VERCEL,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username },
      sessionId: session.id
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
