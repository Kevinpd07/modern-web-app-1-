import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllTools, addTool, getSession } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  try {
    const tools = getAllTools(session.user_id);
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, url, category = 'General' } = body;
    
    if (!id || !name || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, url' },
        { status: 400 }
      );
    }

    const tool = addTool({ id, user_id: session.user_id, name, url, category });
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error('Error adding tool:', error);
    return NextResponse.json({ error: 'Failed to add tool' }, { status: 500 });
  }
}