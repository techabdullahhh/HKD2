import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { listCategories, listDeals, listProducts } from "../services/catalog";
import { requireAuth } from "../state";

export function registerCatalogIpc(db: Database.Database): void {
  ipcMain.handle(CH.catalogCategories, (_e, includeInactive?: boolean) => {
    requireAuth();
    return listCategories(db, includeInactive);
  });

  ipcMain.handle(CH.catalogProducts, (_e, includeInactive?: boolean) => {
    requireAuth();
    return listProducts(db, includeInactive);
  });

  ipcMain.handle(CH.catalogDeals, (_e, includeInactive?: boolean) => {
    requireAuth();
    return listDeals(db, includeInactive);
  });
}
