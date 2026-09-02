import type Database from "better-sqlite3";
import { registerAuthIpc } from "./auth";
import { registerSessionsIpc } from "./sessions";
import { registerCatalogIpc } from "./catalog";
import { registerOrdersIpc } from "./orders";
import { registerMyOrdersIpc } from "./myOrders";
import { registerMyStatsIpc } from "./myStats";
import { registerReportsIpc } from "./reports";
import { registerSettingsIpc } from "./settings";
import { registerEmployeesIpc } from "./employees";
import { registerMenuIpc } from "./menu";
import { registerPrinterIpc } from "./printer";
import { registerAuditIpc } from "./audit";
import { registerBackupIpc } from "./backup";

export function registerIpcHandlers(db: Database.Database): void {
  registerAuthIpc(db);
  registerSessionsIpc(db);
  registerCatalogIpc(db);
  registerOrdersIpc(db);
  registerMyOrdersIpc(db);
  registerMyStatsIpc(db);
  registerReportsIpc(db);
  registerSettingsIpc(db);
  registerEmployeesIpc(db);
  registerMenuIpc(db);
  registerPrinterIpc(db);
  registerAuditIpc(db);
  registerBackupIpc(db);
}
