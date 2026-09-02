import type Database from "better-sqlite3";
import type {
  EmployeeDashboardStats,
  EmployeeSessionSummary,
  PaymentBreakdownEntry,
  TopItemEntry
} from "../../../shared/types";

interface Scope {
  businessDate?: string;
  sessionId?: number;
}

// Every query here is hard-scoped to a single userId, passed in by the IPC
// layer from the server-side "who is currently logged in" state — never from
// a renderer-supplied argument. This is what keeps one employee's sales,
// invoices, and session data invisible to every other employee.
function scopeClause(userId: number, scope: Scope): { where: string; params: unknown[] } {
  const clauses = ["user_id = ?", "status = 'completed'"];
  const params: unknown[] = [userId];
  if (scope.businessDate) {
    clauses.push("business_date = ?");
    params.push(scope.businessDate);
  }
  if (scope.sessionId) {
    clauses.push("employee_session_id = ?");
    params.push(scope.sessionId);
  }
  return { where: clauses.join(" AND "), params };
}

export function getEmployeeDashboard(
  db: Database.Database,
  userId: number,
  sessionId: number,
  businessDate: string
): EmployeeDashboardStats {
  const day = scopeClause(userId, { businessDate });
  const dayRow = db.prepare(`SELECT COUNT(*) AS c, COALESCE(SUM(grand_total),0) AS s FROM orders WHERE ${day.where}`).get(...day.params) as {
    c: number;
    s: number;
  };

  const sess = scopeClause(userId, { sessionId });
  const sessRow = db.prepare(`SELECT COUNT(*) AS c, COALESCE(SUM(grand_total),0) AS s FROM orders WHERE ${sess.where}`).get(...sess.params) as {
    c: number;
    s: number;
  };

  const sessionRow = db.prepare("SELECT started_at FROM employee_sessions WHERE id = ?").get(sessionId) as
    | { started_at: string }
    | undefined;

  return {
    businessDate,
    businessDay: { invoiceCount: dayRow.c, sales: dayRow.s },
    session: { id: sessionId, startedAt: sessionRow?.started_at ?? "", invoiceCount: sessRow.c, sales: sessRow.s }
  };
}

export function getEmployeePaymentBreakdown(db: Database.Database, userId: number, scope: Scope): PaymentBreakdownEntry[] {
  const s = scopeClause(userId, scope);
  return db
    .prepare(
      `SELECT payment_method AS paymentMethod, COUNT(*) AS invoiceCount, COALESCE(SUM(grand_total),0) AS total
       FROM orders WHERE ${s.where} GROUP BY payment_method`
    )
    .all(...s.params) as PaymentBreakdownEntry[];
}

export function getEmployeeTopItems(db: Database.Database, userId: number, scope: Scope, limit = 5): TopItemEntry[] {
  const clauses = ["o.user_id = ?", "o.status = 'completed'"];
  const params: unknown[] = [userId];
  if (scope.businessDate) {
    clauses.push("o.business_date = ?");
    params.push(scope.businessDate);
  }
  if (scope.sessionId) {
    clauses.push("o.employee_session_id = ?");
    params.push(scope.sessionId);
  }
  return db
    .prepare(
      `SELECT oi.name_snapshot AS name, oi.variant_snapshot AS variant, SUM(oi.quantity) AS quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE ${clauses.join(" AND ")}
       GROUP BY oi.name_snapshot, oi.variant_snapshot
       ORDER BY quantity DESC
       LIMIT ?`
    )
    .all(...params, limit) as TopItemEntry[];
}

export function getEmployeeSessionSummary(db: Database.Database, sessionId: number, userId: number): EmployeeSessionSummary {
  const sessionRow = db.prepare("SELECT started_at, ended_at FROM employee_sessions WHERE id = ?").get(sessionId) as {
    started_at: string;
    ended_at: string | null;
  };
  const completed = scopeClause(userId, { sessionId });
  const completedRow = db
    .prepare(`SELECT COUNT(*) AS c, COALESCE(SUM(grand_total),0) AS s FROM orders WHERE ${completed.where}`)
    .get(...completed.params) as { c: number; s: number };
  const cancelledRow = db
    .prepare("SELECT COUNT(*) AS c FROM orders WHERE employee_session_id = ? AND user_id = ? AND status = 'cancelled'")
    .get(sessionId, userId) as { c: number };

  return {
    sessionId,
    startedAt: sessionRow.started_at,
    endedAt: sessionRow.ended_at,
    invoiceCount: completedRow.c,
    sales: completedRow.s,
    cancelledCount: cancelledRow.c,
    paymentBreakdown: getEmployeePaymentBreakdown(db, userId, { sessionId })
  };
}
