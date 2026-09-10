import type { Settings } from "@shared/types";
import { formatPKR } from "@/lib/format";
import logo from "@/assets/images/logo-receipt.png";

const SAMPLE_ITEMS = [
  { qty: 1, name: "Crown Crust", variant: "Large", price: 1200 },
  { qty: 2, name: "Zinger Burger", variant: "Regular", price: 300 },
  { qty: 1, name: "1.5 Ltr Bottle", variant: "Regular", price: 230 }
];

/**
 * Pure presentational sample-receipt layout — used both by the hidden print
 * window and by the on-screen preview shown before a test receipt is
 * actually sent to the printer.
 */
export function TestReceiptView({ settings }: { settings: Settings }) {
  const subtotal = SAMPLE_ITEMS.reduce((sum, i) => sum + i.qty * i.price, 0);
  const grandTotal = subtotal + settings.serviceChargeDefault;
  const now = new Date();

  return (
    <div className="mx-auto w-[280px] bg-white p-2 font-mono text-[12px] leading-tight text-black">
      <div className="text-center">
        <div className="text-base font-bold">*** TEST PRINT ***</div>
        <div className="text-[11px]">No sale — printer setup check</div>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="text-center">
        <img src={logo} alt="" className="mx-auto mb-1 w-[62%]" />
        <div className="text-base font-bold">{settings.restaurantNameEn}</div>
        <div dir="rtl" className="urdu-text text-base leading-normal">
          {settings.restaurantNameUr}
        </div>
        {settings.restaurantPhone && <div>{settings.restaurantPhone}</div>}
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div>Printed: {now.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</div>
      <div>Paper width: {settings.printerPaperWidthMm}mm</div>
      <div>Printer: {settings.printerName || "(none selected)"}</div>
      <div className="my-2 border-t border-dashed border-black" />
      {SAMPLE_ITEMS.map((item, idx) => (
        <div key={idx} className="mb-1 flex justify-between">
          <span>
            {item.qty}x {item.name} ({item.variant})
          </span>
          <span>{formatPKR(item.qty * item.price)}</span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPKR(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Service Charges</span>
        <span>{formatPKR(settings.serviceChargeDefault)}</span>
      </div>
      <div className="my-1 flex justify-between text-base font-bold">
        <span>Grand Total</span>
        <span>{formatPKR(grandTotal)}</span>
      </div>
      <div>Payment: CASH (sample)</div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="text-center">
        If this printed clearly at the right width and cut cleanly, your
        thermal printer is configured correctly.
      </div>
    </div>
  );
}
