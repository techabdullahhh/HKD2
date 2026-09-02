import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { login } from "../services/auth";
import { logAudit } from "../services/audit";
import { clearCurrentAuth, getCurrentUser, setCurrentAuth } from "../state";

export function registerAuthIpc(db: Database.Database): void {
  ipcMain.handle(CH.authLogin, (_e: IpcMainInvokeEvent, username: string, password: string) => {
    const result = login(db, username, password);
    setCurrentAuth(result.user, result.session!);
    logAudit(db, { userId: result.user.id, action: "user_login", entityType: "user", entityId: result.user.id });
    return result;
  });

  ipcMain.handle(CH.authLogout, () => {
    const user = getCurrentUser();
    if (user) logAudit(db, { userId: user.id, action: "user_logout", entityType: "user", entityId: user.id });
    // Logging out never ends the underlying work session — only an explicit
    // "End Session" action does that. This just returns to the login screen.
    clearCurrentAuth();
  });

  ipcMain.handle(CH.authCurrentUser, () => getCurrentUser());
}
