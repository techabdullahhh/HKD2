import { BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from "../env";
import { getMainWindow } from "../index";
import { CH } from "../../../shared/channels";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function listPrinters() {
  const win = getMainWindow();
  if (!win) return [];
  return win.webContents.getPrintersAsync();
}

const PAPER_WIDTH_MICRONS: Record<58 | 80, number> = {
  58: 58000,
  80: 80000
};

interface SendToPrinterParams {
  query: string;
  printerName: string | null;
  paperWidthMm: 58 | 80;
  silent: boolean;
}

function sendToPrinter(params: SendToPrinterParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    if (VITE_DEV_SERVER_URL) {
      printWin.loadURL(`${VITE_DEV_SERVER_URL}?${params.query}`);
    } else {
      printWin.loadFile(path.join(RENDERER_DIST, "index.html"), { search: params.query });
    }

    const cleanup = () => {
      ipcMain.removeListener(CH.printReady, onReady);
      if (!printWin.isDestroyed()) printWin.close();
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Print template did not become ready in time"));
    }, 15000);

    function onReady(event: Electron.IpcMainEvent) {
      if (event.sender.id !== printWin.webContents.id) return;
      clearTimeout(timeout);
      printWin.webContents.print(
        {
          silent: params.silent,
          deviceName: params.printerName ?? undefined,
          printBackground: true,
          margins: { marginType: "none" },
          pageSize: { width: PAPER_WIDTH_MICRONS[params.paperWidthMm], height: 297000 }
        },
        (success, errorType) => {
          cleanup();
          if (success) resolve();
          else reject(new Error(errorType || "Print failed"));
        }
      );
    }

    ipcMain.on(CH.printReady, onReady);
  });
}

export function printInvoice(params: {
  orderId: number;
  printerName: string | null;
  paperWidthMm: 58 | 80;
  silent: boolean;
}): Promise<void> {
  return sendToPrinter({ ...params, query: `print=invoice&orderId=${params.orderId}` });
}

// Prints a static sample receipt — no real order/sale involved — so Admin can
// verify a newly connected thermal printer (alignment, paper width, cut,
// cash-drawer kick if wired) without ringing up a fake sale first.
export function printTestReceipt(params: { printerName: string | null; paperWidthMm: 58 | 80; silent: boolean }): Promise<void> {
  return sendToPrinter({ ...params, query: "print=test" });
}
