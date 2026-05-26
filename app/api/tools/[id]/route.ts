import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteTool, updateTool, getSession } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const success = deleteTool(id, session.user_id);
    
    if (!success) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    const success = updateTool(id, session.user_id, body);
    
    if (!success) {
      return NextResponse.json({ error: 'Tool not found or no changes made' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}