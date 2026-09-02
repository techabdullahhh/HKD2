import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import type { Settings } from "../../../shared/types";
import { getSettings, updateSettings } from "../services/settings";
import { logAudit } from "../services/audit";
import { requireAdmin, requireAuth } from "../state";

export function registerSettingsIpc(db: Database.Database): void {
  ipcMain.handle(CH.settingsGet, () => {
    requireAuth();
    return getSettings(db);
  });

  ipcMain.handle(CH.settingsUpdate, (_e, partial: Partial<Settings>) => {
    const admin = requireAdmin();
    const before = getSettings(db);
    const updated = updateSettings(db, partial);
    logAudit(db, {
      userId: admin.id,
      action: "settings_changed",
      entityType: "settings",
      details: { before, after: updated }
    });
    return updated;
  });
}
