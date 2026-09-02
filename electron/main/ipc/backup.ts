import { app, dialog, ipcMain } from "electron";
import fs from "node:fs";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { closeDatabase, getDbPath } from "../db";
import { logAudit } from "../services/audit";
import { getMainWindow } from "../index";
import { requireAdmin } from "../state";

export function registerBackupIpc(db: Database.Database): void {
  ipcMain.handle(CH.backupExport, async () => {
    const admin = requireAdmin();
    const win = getMainWindow();
    const defaultName = `hkd-backup-${new Date().toISOString().slice(0, 10)}.db`;
    const result = await dialog.showSaveDialog(win!, {
      title: "Backup HKD Database",
      defaultPath: defaultName,
      filters: [{ name: "SQLite Database", extensions: ["db"] }]
    });
    if (result.canceled || !result.filePath) return null;

    db.pragma("wal_checkpoint(TRUNCATE)");
    fs.copyFileSync(getDbPath(), result.filePath);
    logAudit(db, { userId: admin.id, action: "backup_exported", entityType: "database", details: { path: result.filePath } });
    return { path: result.filePath };
  });

  ipcMain.handle(CH.backupImport, async () => {
    const admin = requireAdmin();
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win!, {
      title: "Restore HKD Database",
      properties: ["openFile"],
      filters: [{ name: "SQLite Database", extensions: ["db"] }]
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const chosenPath = result.filePaths[0];

    const confirm = await dialog.showMessageBox(win!, {
      type: "warning",
      buttons: ["Cancel", "Restore and Restart"],
      defaultId: 0,
      cancelId: 0,
      title: "Restore Database",
      message: "This will replace ALL current data with the selected backup and restart the application. This cannot be undone. Continue?"
    });
    if (confirm.response !== 1) return null;

    logAudit(db, { userId: admin.id, action: "backup_imported", entityType: "database", details: { path: chosenPath } });
    closeDatabase();
    fs.copyFileSync(chosenPath, getDbPath());
    app.relaunch();
    app.exit(0);
    return { path: chosenPath };
  });
}
