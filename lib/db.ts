import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), '..', 'data', 'tools.db');

// Ensure the data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Create the tools table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create the users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create the sessions table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

export interface Tool {
  id: string;
  name: string;
  url: string;
  category: string;
  created_at?: string;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at?: string;
}

export function getAllTools(): Tool[] {
  const stmt = db.prepare('SELECT * FROM tools ORDER BY created_at DESC');
  return stmt.all() as Tool[];
}

export function addTool(tool: Omit<Tool, 'created_at'>): Tool {
  const stmt = db.prepare(
    'INSERT INTO tools (id, name, url, category) VALUES (?, ?, ?, ?)'
  );
  stmt.run(tool.id, tool.name, tool.url, tool.category);
  return { ...tool };
}

export function deleteTool(id: string): boolean {
  const stmt = db.prepare('DELETE FROM tools WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'created_at'>>): boolean {
  const fields: string[] = [];
  const values: (string | undefined)[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.url !== undefined) {
    fields.push('url = ?');
    values.push(updates.url);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  const stmt = db.prepare(`UPDATE tools SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

export default db;

// User functions
export function getAllUsers(): Omit<User, 'password_hash'>[] {
  const stmt = db.prepare('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
  return stmt.all() as Omit<User, 'password_hash'>[];
}

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function createUser(id: string, username: string, passwordHash: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)'
  );
  stmt.run(id, username, passwordHash);
  return { id, username, password_hash: passwordHash };
}

export function deleteUser(id: string): boolean {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function updateUser(id: string, username: string, passwordHash?: string): boolean {
  if (passwordHash) {
    const stmt = db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?');
    const result = stmt.run(username, passwordHash, id);
    return result.changes > 0;
  } else {
    const stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?');
    const result = stmt.run(username, id);
    return result.changes > 0;
  }
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Session functions
export function createSession(id: string, userId: string, expiresAt: Date): Session {
  const stmt = db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  );
  stmt.run(id, userId, expiresAt.toISOString());
  return { id, user_id: userId, expires_at: expiresAt.toISOString() };
}

export function getSession(sessionId: string): (Session & { username: string }) | undefined {
  const stmt = db.prepare(`
    SELECT sessions.*, users.username 
    FROM sessions 
    JOIN users ON sessions.user_id = users.id 
    WHERE sessions.id = ? AND sessions.expires_at > datetime('now')
  `);
  return stmt.get(sessionId) as (Session & { username: string }) | undefined;
}

export function deleteSession(sessionId: string): boolean {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  const result = stmt.run(sessionId);
  return result.changes > 0;
}

export function deleteExpiredSessions(): void {
  const stmt = db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')");
  stmt.run();
}

// Force module refresh

// Create default admin user if no admin user exists
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const adminId = crypto.randomUUID();
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT OR IGNORE INTO users (id, username, password_hash) VALUES (?, ?, ?)')
    .run(adminId, 'admin', passwordHash);
}
