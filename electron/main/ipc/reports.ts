import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import type { ReportRange } from "../../../shared/types";
import * as reports from "../services/reports";
import { requireAdmin } from "../state";

export function registerReportsIpc(db: Database.Database): void {
  const wrap = <T>(fn: (db: Database.Database, range: Partial<ReportRange>) => T) => (_e: unknown, range: Partial<ReportRange> = {}) => {
    requireAdmin();
    return fn(db, range);
  };

  ipcMain.handle(CH.reportsSummary, wrap(reports.salesSummary));
  ipcMain.handle(CH.reportsByBusinessDate, wrap(reports.salesByBusinessDate));
  ipcMain.handle(CH.reportsByEmployee, wrap(reports.salesByEmployee));
  ipcMain.handle(CH.reportsProducts, wrap(reports.productSales));
  ipcMain.handle(CH.reportsCategories, wrap(reports.categorySales));
  ipcMain.handle(CH.reportsPizzaSizes, wrap(reports.pizzaSizeSales));
  ipcMain.handle(CH.reportsDeals, wrap(reports.dealSales));
  ipcMain.handle(CH.reportsPaymentMethods, wrap(reports.paymentMethodTotals));
  ipcMain.handle(CH.reportsCancellations, wrap(reports.cancellationsReport));
}
