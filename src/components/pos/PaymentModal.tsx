import { useState } from "react";
import type { PaymentMethod } from "@shared/types";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { formatPKR } from "@/lib/format";

interface Props {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  serviceCharge: number;
  onConfirm: (method: PaymentMethod, amountTendered?: number) => Promise<void>;
}

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "other", label: "Other", icon: "🧾" }
];

export function PaymentModal({ open, onClose, subtotal, serviceCharge, onConfirm }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const grandTotal = subtotal + serviceCharge;
  const tenderedNum = Number(tendered) || 0;
  const change = tenderedNum - grandTotal;

  async function confirm() {
    setSubmitting(true);
    try {
      await onConfirm(method, method === "cash" ? tenderedNum : undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Payment">
      <div className="flex flex-col gap-5">
        <div className="space-y-1 rounded-xl bg-white/5 p-4">
          <div className="flex justify-between text-hkd-cream/70">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-hkd-cream/70">
            <span>Service Charges</span>
            <span>{formatPKR(serviceCharge)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-xl font-bold text-hkd-yellow">
            <span>Grand Total</span>
            <span>{formatPKR(grandTotal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`rounded-xl border-2 py-3 text-center text-sm font-bold transition-colors ${
                method === m.id ? "border-hkd-pink bg-hkd-pink/20 text-white" : "border-white/10 bg-white/5 text-hkd-cream/70"
              }`}
            >
              <div className="text-xl">{m.icon}</div>
              {m.label}
            </button>
          ))}
        </div>

        {method === "cash" && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Amount Tendered</label>
            <input
              autoFocus
              inputMode="numeric"
              value={tendered}
              onChange={(e) => setTendered(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-xl border border-white/15 bg-hkd-black px-3 py-2.5 text-lg text-hkd-cream outline-none focus:border-hkd-pink"
              placeholder="0"
            />
            {tendered && (
              <div className={`mt-2 text-lg font-bold ${change < 0 ? "text-red-400" : "text-hkd-green"}`}>
                {change < 0 ? `Short by ${formatPKR(Math.abs(change))}` : `Change Due: ${formatPKR(change)}`}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="success"
          disabled={submitting || (method === "cash" && tenderedNum < grandTotal)}
          onClick={confirm}
        >
          {submitting ? "Processing…" : `Complete Sale — ${formatPKR(grandTotal)}`}
        </Button>
      </div>
    </Modal>
  );
}
