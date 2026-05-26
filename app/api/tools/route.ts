import { NextResponse } from 'next/server';
import { getAllTools, addTool } from '@/lib/db';

export async function GET() {
  try {
    const tools = getAllTools();
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, url, category = 'General' } = body;
    
    if (!id || !name || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, url' },
        { status: 400 }
      );
    }
    
    const tool = addTool({ id, name, url, category });
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error('Error adding tool:', error);
    return NextResponse.json({ error: 'Failed to add tool' }, { status: 500 });
  }
}
