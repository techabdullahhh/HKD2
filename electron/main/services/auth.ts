import type Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import type { LoginResult, Role, SafeUser } from "../../../shared/types";
import { resolveOrCreateSession } from "./sessions";

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  active: number;
}

function toSafeUser(row: UserRow): SafeUser {
  return { id: row.id, username: row.username, fullName: row.full_name, role: row.role, active: !!row.active };
}

export class AuthError extends Error {}

export function login(db: Database.Database, username: string, password: string): LoginResult {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRow | undefined;
  if (!row) throw new AuthError("Invalid username or password");
  if (!row.active) throw new AuthError("This account has been disabled");
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) throw new AuthError("Invalid username or password");

  const user = toSafeUser(row);
  // Every logged-in user (admin or employee) gets a work session, since every
  // order must be attached to one. Sessions persist until explicitly ended —
  // never auto-closed by logout or midnight rollover.
  const session = resolveOrCreateSession(db, user.id);
  return { user, session };
}

export function getUserById(db: Database.Database, id: number): SafeUser | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toSafeUser(row) : null;
}
