import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { requireAdmin } from "../state";

export function registerAuditIpc(db: Database.Database): void {
  ipcMain.handle(CH.auditList, (_e, filter?: { from?: string; to?: string; limit?: number }) => {
    requireAdmin();
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (filter?.from) {
      clauses.push("a.created_at >= ?");
      params.push(filter.from);
    }
    if (filter?.to) {
      clauses.push("a.created_at <= ?");
      params.push(filter.to);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = Math.min(filter?.limit ?? 200, 1000);
    const rows = db
      .prepare(
        `SELECT a.id, a.user_id AS userId, u.full_name AS userName, a.action, a.entity_type AS entityType,
                a.entity_id AS entityId, a.details, a.created_at AS createdAt
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.user_id
         ${where}
         ORDER BY a.id DESC
         LIMIT ?`
      )
      .all(...params, limit);
    return rows;
  });
}
