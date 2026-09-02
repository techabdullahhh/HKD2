import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { listOrders } from "../services/orders";
import { requireAuth } from "../state";

export function registerMyOrdersIpc(db: Database.Database): void {
  // Hard-forces userId to the caller's own id — an employee cannot pass a
  // different userId to see someone else's orders/invoices.
  ipcMain.handle(CH.myOrdersList, (_e, filter?: { search?: string; from?: string; to?: string }) => {
    const user = requireAuth();
    return listOrders(db, {
      userId: user.id,
      businessDateFrom: filter?.from,
      businessDateTo: filter?.to,
      search: filter?.search
    });
  });
}
