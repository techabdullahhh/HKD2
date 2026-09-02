import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import type { StatsScope } from "../../../shared/types";
import {
  getEmployeeDashboard,
  getEmployeePaymentBreakdown,
  getEmployeeSessionSummary,
  getEmployeeTopItems
} from "../services/employeeStats";
import { computeBusinessDate } from "../services/businessDate";
import { getSettings } from "../services/settings";
import { requireAuth, requireSession } from "../state";

function resolveScope(db: Database.Database, scope: StatsScope, sessionId: number) {
  if (scope === "session") return { sessionId };
  const settings = getSettings(db);
  return { businessDate: computeBusinessDate(new Date(), settings.businessDayStartHour) };
}

// Every handler here resolves identity from server-side session state
// (requireAuth/requireSession) only — no renderer-supplied userId/sessionId
// is ever accepted, so an employee has no way to request another
// employee's dashboard, payment breakdown, top items, or session summary.
export function registerMyStatsIpc(db: Database.Database): void {
  ipcMain.handle(CH.myStatsDashboard, () => {
    const user = requireAuth();
    const session = requireSession();
    const settings = getSettings(db);
    const businessDate = computeBusinessDate(new Date(), settings.businessDayStartHour);
    return getEmployeeDashboard(db, user.id, session.id, businessDate);
  });

  ipcMain.handle(CH.myStatsPaymentBreakdown, (_e, scope: StatsScope) => {
    const user = requireAuth();
    const session = requireSession();
    return getEmployeePaymentBreakdown(db, user.id, resolveScope(db, scope, session.id));
  });

  ipcMain.handle(CH.myStatsTopItems, (_e, scope: StatsScope, limit?: number) => {
    const user = requireAuth();
    const session = requireSession();
    return getEmployeeTopItems(db, user.id, resolveScope(db, scope, session.id), limit);
  });

  ipcMain.handle(CH.myStatsSessionSummary, () => {
    const user = requireAuth();
    const session = requireSession();
    return getEmployeeSessionSummary(db, session.id, user.id);
  });
}
