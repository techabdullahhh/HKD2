import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { endSession, listSessions } from "../services/sessions";
import { logAudit } from "../services/audit";
import { clearCurrentAuth, getCurrentSession, requireAdmin, requireAuth } from "../state";

export function registerSessionsIpc(db: Database.Database): void {
  ipcMain.handle(CH.sessionsEndMine, () => {
    const user = requireAuth();
    const session = getCurrentSession();
    if (session) {
      endSession(db, session.id);
      logAudit(db, { userId: user.id, action: "session_ended", entityType: "employee_session", entityId: session.id });
    }
    clearCurrentAuth();
  });

  ipcMain.handle(CH.sessionsList, (_e, filter) => {
    requireAdmin();
    return listSessions(db, filter);
  });

  ipcMain.handle(CH.sessionsEndById, (_e, sessionId: number) => {
    const admin = requireAdmin();
    endSession(db, sessionId);
    logAudit(db, { userId: admin.id, action: "session_ended_by_admin", entityType: "employee_session", entityId: sessionId });
  });
}
