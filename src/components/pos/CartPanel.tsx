import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { CartLineRow } from "./CartLineRow";
import { PaymentModal } from "./PaymentModal";
import { HeldOrdersModal } from "./HeldOrdersModal";
import { ReceiptPreviewModal } from "./ReceiptPreviewModal";
import { Button } from "@/components/common/Button";
import { formatPKR } from "@/lib/format";
import type { PaymentMethod } from "@shared/types";

export function CartPanel({ serviceCharge }: { serviceCharge: number }) {
  const { lines, subtotal, clear, toOrderItems, resumingOrderId } = useCartStore();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [receiptOrderId, setReceiptOrderId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sub = subtotal();

  async function handleHold() {
    if (lines.length === 0) return;
    setBusy(true);
    setLastError(null);
    try {
      await window.hkd.orders.hold(toOrderItems());
      clear();
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to hold order");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmPayment(method: PaymentMethod, amountTendered?: number) {
    setLastError(null);
    try {
      const order = resumingOrderId
        ? await window.hkd.orders.checkout({ orderId: resumingOrderId, paymentMethod: method, amountTendered })
        : await window.hkd.orders.checkout({ items: toOrderItems(), paymentMethod: method, amountTendered });
      clear();
      setPaymentOpen(false);
      // Show the receipt on screen — employee reviews it, then prints from
      // the preview, rather than it firing straight at the printer unseen.
      setReceiptOrderId(order.id);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Checkout failed");
      throw err;
    }
  }

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-white/10 bg-hkd-charcoal">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <h2 className="font-display text-base tracking-wide text-hkd-cream">Current Order</h2>
        <Button variant="secondary" size="md" onClick={() => setHeldOpen(true)}>
          Held
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {lines.length === 0 && <p className="mt-10 text-center text-sm text-hkd-cream/40">Cart is empty. Tap a product to add it.</p>}
        <div className="flex flex-col gap-2">
          {lines.map((line) => (
            <CartLineRow key={line.lineId} line={line} />
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        {lastError && <div className="mb-2 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-semibold text-red-400">{lastError}</div>}
        <div className="space-y-0.5 text-sm">
          <div className="flex justify-between text-hkd-cream/70">
            <span>Subtotal</span>
            <span>{formatPKR(sub)}</span>
          </div>
          <div className="flex justify-between text-hkd-cream/70">
            <span>Service Charges</span>
            <span>{formatPKR(serviceCharge)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1.5 text-lg font-bold text-hkd-yellow">
            <span>Grand Total</span>
            <span>{formatPKR(sub + serviceCharge)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" disabled={lines.length === 0 || busy} onClick={handleHold}>
            Hold Order
          </Button>
          <Button variant="primary" size="lg" disabled={lines.length === 0 || busy} onClick={() => setPaymentOpen(true)}>
            Checkout
          </Button>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        subtotal={sub}
        serviceCharge={serviceCharge}
        onConfirm={handleConfirmPayment}
      />
      <HeldOrdersModal open={heldOpen} onClose={() => setHeldOpen(false)} />
      <ReceiptPreviewModal orderId={receiptOrderId} onClose={() => setReceiptOrderId(null)} />
    </div>
  );
}
