import { NextResponse } from 'next/server';
import { deleteUser, getUserById, updateUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function verifyAdminAccess(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('x-admin-password');
  return authHeader === ADMIN_PASSWORD;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { username, password } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'El usuario es requerido' },
        { status: 400 }
      );
    }

    const user = getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let passwordHash = undefined;
    if (password && password.length >= 4) {
      passwordHash = await bcrypt.hash(password, 10);
    } else if (password && password.length < 4) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    const success = updateUser(id, username, passwordHash);

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}
