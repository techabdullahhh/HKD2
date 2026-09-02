import type Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import type { Role, SafeUser } from "../../../shared/types";

interface UserRow {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  active: number;
}

function toSafeUser(row: UserRow): SafeUser {
  return { id: row.id, username: row.username, fullName: row.full_name, role: row.role, active: !!row.active };
}

export function listUsers(db: Database.Database): SafeUser[] {
  const rows = db.prepare("SELECT id, username, full_name, role, active FROM users ORDER BY role, full_name").all() as UserRow[];
  return rows.map(toSafeUser);
}

export function createUser(
  db: Database.Database,
  params: { username: string; password: string; fullName: string; role: Role }
): SafeUser {
  const hash = bcrypt.hashSync(params.password, 10);
  const result = db
    .prepare("INSERT INTO users (username, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, 1)")
    .run(params.username, hash, params.fullName, params.role);
  const row = db.prepare("SELECT id, username, full_name, role, active FROM users WHERE id = ?").get(
    result.lastInsertRowid
  ) as UserRow;
  return toSafeUser(row);
}

export function setUserActive(db: Database.Database, userId: number, active: boolean): SafeUser {
  db.prepare("UPDATE users SET active = ? WHERE id = ?").run(active ? 1 : 0, userId);
  const row = db.prepare("SELECT id, username, full_name, role, active FROM users WHERE id = ?").get(userId) as UserRow;
  return toSafeUser(row);
}

export function resetPassword(db: Database.Database, userId: number, newPassword: string): void {
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, userId);
}

export function updateUser(
  db: Database.Database,
  userId: number,
  params: { fullName?: string; username?: string }
): SafeUser {
  if (params.fullName !== undefined) {
    db.prepare("UPDATE users SET full_name = ? WHERE id = ?").run(params.fullName, userId);
  }
  if (params.username !== undefined) {
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(params.username, userId);
  }
  const row = db.prepare("SELECT id, username, full_name, role, active FROM users WHERE id = ?").get(userId) as UserRow;
  return toSafeUser(row);
}
