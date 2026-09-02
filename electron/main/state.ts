import type { EmployeeSession, SafeUser } from "../../shared/types";

let currentUser: SafeUser | null = null;
let currentSession: EmployeeSession | null = null;

export function getCurrentUser(): SafeUser | null {
  return currentUser;
}

export function getCurrentSession(): EmployeeSession | null {
  return currentSession;
}

export function setCurrentAuth(user: SafeUser, session: EmployeeSession): void {
  currentUser = user;
  currentSession = session;
}

export function updateCurrentSession(session: EmployeeSession): void {
  currentSession = session;
}

export function clearCurrentAuth(): void {
  currentUser = null;
  currentSession = null;
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
  }
}

export function requireAuth(): SafeUser {
  if (!currentUser) throw new UnauthorizedError("Not logged in");
  return currentUser;
}

export function requireAdmin(): SafeUser {
  const user = requireAuth();
  if (user.role !== "admin") throw new UnauthorizedError("Admin access required");
  return user;
}

export function requireSession(): EmployeeSession {
  requireAuth();
  if (!currentSession) throw new UnauthorizedError("No active session");
  return currentSession;
}
