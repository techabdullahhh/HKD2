import { useState } from "react";
import type { CartLine } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/format";

export function CartLineRow({ line }: { line: CartLine }) {
  const { incrementLine, decrementLine, removeLine, setNotes } = useCartStore();
  const [showNotes, setShowNotes] = useState(!!line.notes);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-hkd-cream">{line.name}</div>
          {line.variantName && <div className="text-xs text-hkd-cream/50">{line.variantName}</div>}
          {line.dealChoices && line.dealChoices.length > 0 && (
            <div className="mt-0.5 text-xs text-hkd-cream/50">
              {line.dealChoices.map((c) => `${c.label}: ${c.productName}${c.variantName ? ` (${c.variantName})` : ""}`).join(" • ")}
            </div>
          )}
        </div>
        <div className="shrink-0 text-sm font-bold text-hkd-yellow">{formatPKR(line.unitPrice * line.quantity)}</div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => decrementLine(line.lineId)}
            aria-label="Decrease quantity"
            className="grid h-8 w-8 place-items-center rounded-lg bg-hkd-black text-lg font-bold text-hkd-cream hover:bg-white/10 active:scale-95"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
          <button
            onClick={() => incrementLine(line.lineId)}
            aria-label="Increase quantity"
            className="grid h-8 w-8 place-items-center rounded-lg bg-hkd-black text-lg font-bold text-hkd-cream hover:bg-white/10 active:scale-95"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="rounded-lg bg-hkd-black px-2 py-1.5 text-xs font-semibold text-hkd-cream/80 hover:bg-white/10"
          >
            Note
          </button>
          <button
            onClick={() => removeLine(line.lineId)}
            aria-label="Remove item"
            className="grid h-8 w-8 place-items-center rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30"
          >
            🗑
          </button>
        </div>
      </div>

      {showNotes && (
        <input
          value={line.notes}
          onChange={(e) => setNotes(line.lineId, e.target.value)}
          placeholder="e.g. no onions, extra spicy…"
          className="mt-2 w-full rounded-lg border border-white/10 bg-hkd-black px-2.5 py-1.5 text-xs text-hkd-cream outline-none focus:border-hkd-pink"
        />
      )}
    </div>
  );
}
