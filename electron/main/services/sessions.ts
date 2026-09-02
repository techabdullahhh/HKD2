import type Database from "better-sqlite3";
import type { EmployeeSession } from "../../../shared/types";

interface SessionRow {
  id: number;
  user_id: number;
  started_at: string;
  ended_at: string | null;
}

function toSessionSummary(db: Database.Database, row: SessionRow): EmployeeSession {
  const agg = db
    .prepare(
      "SELECT COUNT(*) AS cnt, COALESCE(SUM(grand_total), 0) AS total FROM orders WHERE employee_session_id = ? AND status = 'completed'"
    )
    .get(row.id) as { cnt: number; total: number };
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    invoiceCount: agg.cnt,
    totalSales: agg.total
  };
}

/**
 * Resumes an already-open session for this user (including across app
 * restarts) or starts a new one. Sessions are NEVER closed automatically by
 * date/midnight rollover — only by an explicit "End Session" action.
 */
export function resolveOrCreateSession(db: Database.Database, userId: number): EmployeeSession {
  const open = db
    .prepare("SELECT * FROM employee_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY id DESC LIMIT 1")
    .get(userId) as SessionRow | undefined;
  if (open) return toSessionSummary(db, open);

  const result = db.prepare("INSERT INTO employee_sessions (user_id) VALUES (?)").run(userId);
  const created = db
    .prepare("SELECT * FROM employee_sessions WHERE id = ?")
    .get(result.lastInsertRowid) as SessionRow;
  return toSessionSummary(db, created);
}

export function endSession(db: Database.Database, sessionId: number): EmployeeSession {
  db.prepare("UPDATE employee_sessions SET ended_at = datetime('now') WHERE id = ? AND ended_at IS NULL").run(
    sessionId
  );
  const row = db.prepare("SELECT * FROM employee_sessions WHERE id = ?").get(sessionId) as SessionRow;
  return toSessionSummary(db, row);
}

export function getSessionById(db: Database.Database, sessionId: number): EmployeeSession | null {
  const row = db.prepare("SELECT * FROM employee_sessions WHERE id = ?").get(sessionId) as SessionRow | undefined;
  return row ? toSessionSummary(db, row) : null;
}

export function listSessions(
  db: Database.Database,
  filter?: { userId?: number; activeOnly?: boolean }
): (EmployeeSession & { userName: string })[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filter?.userId) {
    clauses.push("es.user_id = ?");
    params.push(filter.userId);
  }
  if (filter?.activeOnly) {
    clauses.push("es.ended_at IS NULL");
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT es.*, u.full_name AS user_name FROM employee_sessions es
       JOIN users u ON u.id = es.user_id
       ${where}
       ORDER BY es.id DESC`
    )
    .all(...params) as (SessionRow & { user_name: string })[];
  return rows.map((row) => ({ ...toSessionSummary(db, row), userName: row.user_name }));
}
