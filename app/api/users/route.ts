import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getAllUsers, getSession, type User } from '@/lib/db';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function createUserWithPassword(username: string, password: string): Promise<User> {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const stmt = db.prepare(
    'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)'
  );
  stmt.run(id, username, passwordHash);
  return { id, username, password_hash: passwordHash };
}

async function verifyAdminAccess(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('x-admin-password');
  return authHeader === ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  const isAdmin = await verifyAdminAccess(request);
  if (!isAdmin) {
    // Check if user is logged in at least
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId || !getSession(sessionId)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    const user = await createUserWithPassword(username, password);
    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if ((error as NodeJS.ErrnoException).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'El nombre de usuario ya existe' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
