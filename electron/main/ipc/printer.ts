import { ipcMain } from "electron";
import type Database from "better-sqlite3";
import { CH } from "../../../shared/channels";
import { listPrinters, printInvoice, printTestReceipt } from "../services/printing";
import { getSettings } from "../services/settings";
import { getOrderById } from "../services/orders";
import { logAudit } from "../services/audit";
import { requireAdmin, requireAuth, UnauthorizedError } from "../state";

export function registerPrinterIpc(db: Database.Database): void {
  ipcMain.handle(CH.printerList, async () => {
    requireAdmin();
    const printers = await listPrinters();
    return printers.map((p) => ({ name: p.name, displayName: p.displayName, isDefault: p.isDefault }));
  });

  ipcMain.handle(CH.printerPrint, async (_e, orderId: number, silent: boolean) => {
    const user = requireAuth();

    // Reprints are only allowed for the invoice's own owner (or an admin) —
    // an employee cannot print another employee's invoice. Every print,
    // including reprints, is still recorded to the audit log below.
    const order = getOrderById(db, orderId);
    if (!order) throw new Error("Order not found");
    if (user.role !== "admin" && order.userId !== user.id) {
      throw new UnauthorizedError("You can only print your own invoices");
    }

    const settings = getSettings(db);
    await printInvoice({
      orderId,
      printerName: settings.printerName,
      paperWidthMm: settings.printerPaperWidthMm,
      silent: silent && !!settings.printerName
    });
    logAudit(db, { userId: user.id, action: "invoice_printed", entityType: "order", entityId: orderId });
  });

  ipcMain.handle(CH.printerTestPrint, async () => {
    const admin = requireAdmin();
    const settings = getSettings(db);
    if (!settings.printerName) {
      throw new Error("Select a printer below first, then test it.");
    }
    await printTestReceipt({
      printerName: settings.printerName,
      paperWidthMm: settings.printerPaperWidthMm,
      silent: true
    });
    logAudit(db, { userId: admin.id, action: "printer_test_print", entityType: "settings" });
  });
}
