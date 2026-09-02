import type Database from "better-sqlite3";

export function logAudit(
  db: Database.Database,
  params: { userId: number | null; action: string; entityType: string; entityId?: number | null; details?: unknown }
): void {
  db.prepare(
    "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
  ).run(
    params.userId,
    params.action,
    params.entityType,
    params.entityId ?? null,
    params.details !== undefined ? JSON.stringify(params.details) : null
  );
}
