import type { Order, Settings } from "@shared/types";
import { formatDateTime, formatPKR } from "@/lib/format";

/**
 * Pure presentational receipt layout — used both by the hidden print window
 * (InvoicePrintPage) and by the on-screen preview shown to the employee
 * before an invoice is actually sent to the printer, so what they see is
 * exactly what prints.
 */
export function ReceiptView({ order, settings }: { order: Order; settings: Settings }) {
  return (
    <div className="mx-auto w-[280px] bg-white p-2 font-mono text-[12px] leading-tight text-black">
      <div className="text-center">
        <div className="text-base font-bold">{settings.restaurantNameEn}</div>
        <div dir="rtl" className="urdu-text text-base leading-normal">
          {settings.restaurantNameUr}
        </div>
        {settings.restaurantPhone && <div>{settings.restaurantPhone}</div>}
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div>Invoice: {order.orderNumber}</div>
      <div>Date: {formatDateTime(order.createdAt)}</div>
      <div>Employee: {order.employeeName}</div>
      <div>Payment: {order.paymentMethod?.toUpperCase() ?? "-"}</div>
      <div className="my-2 border-t border-dashed border-black" />
      {order.items.map((item) => (
        <div key={item.id} className="mb-1">
          <div className="flex justify-between">
            <span>
              {item.quantity}x {item.nameSnapshot}
              {item.variantSnapshot ? ` (${item.variantSnapshot})` : ""}
            </span>
            <span>{formatPKR(item.lineTotal)}</span>
          </div>
          {item.dealChoicesSnapshot?.map((c, idx) => (
            <div key={idx} className="pl-3 text-[11px] text-black/70">
              - {c.label}: {c.productName} {c.variantName ? `(${c.variantName})` : ""}
            </div>
          ))}
          {item.notes && <div className="pl-3 text-[11px] italic text-black/70">Note: {item.notes}</div>}
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPKR(order.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Service Charges</span>
        <span>{formatPKR(order.serviceCharge)}</span>
      </div>
      <div className="my-1 flex justify-between text-base font-bold">
        <span>Grand Total</span>
        <span>{formatPKR(order.grandTotal)}</span>
      </div>
      {order.amountTendered != null && (
        <>
          <div className="flex justify-between">
            <span>Tendered</span>
            <span>{formatPKR(order.amountTendered)}</span>
          </div>
          <div className="flex justify-between">
            <span>Change</span>
            <span>{formatPKR(order.amountTendered - order.grandTotal)}</span>
          </div>
        </>
      )}
      <div className="my-2 border-t border-dashed border-black" />
      <div className="text-center">Thank you for visiting HKD!</div>
    </div>
  );
}
