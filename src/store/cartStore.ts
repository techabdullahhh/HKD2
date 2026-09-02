import { create } from "zustand";
import type { DealSlotChoice, OrderItemInput } from "@shared/types";

export interface CartDealChoiceDisplay extends DealSlotChoice {
  label: string;
  productName: string;
  variantName: string;
}

export interface CartLine {
  lineId: string;
  itemType: "product" | "deal";
  name: string;
  variantName: string | null;
  productId?: number;
  variantId?: number;
  dealId?: number;
  dealChoices?: CartDealChoiceDisplay[];
  unitPrice: number;
  quantity: number;
  notes: string;
}

interface CartState {
  lines: CartLine[];
  resumingOrderId: number | null;
  addProductLine(params: { productId: number; variantId: number; name: string; variantName: string; unitPrice: number }): void;
  addDealLine(params: { dealId: number; name: string; unitPrice: number; choices: CartDealChoiceDisplay[] }): void;
  incrementLine(lineId: string): void;
  decrementLine(lineId: string): void;
  removeLine(lineId: string): void;
  setNotes(lineId: string, notes: string): void;
  clear(): void;
  loadHeldOrder(orderId: number, lines: CartLine[]): void;
  subtotal(): number;
  toOrderItems(): OrderItemInput[];
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  resumingOrderId: null,

  addProductLine({ productId, variantId, name, variantName, unitPrice }) {
    set((state) => {
      const existing = state.lines.find(
        (l) => l.itemType === "product" && l.productId === productId && l.variantId === variantId && !l.notes
      );
      if (existing) {
        return {
          lines: state.lines.map((l) => (l.lineId === existing.lineId ? { ...l, quantity: l.quantity + 1 } : l))
        };
      }
      const line: CartLine = {
        lineId: makeId(),
        itemType: "product",
        name,
        variantName,
        productId,
        variantId,
        unitPrice,
        quantity: 1,
        notes: ""
      };
      return { lines: [...state.lines, line] };
    });
  },

  addDealLine({ dealId, name, unitPrice, choices }) {
    set((state) => ({
      lines: [
        ...state.lines,
        {
          lineId: makeId(),
          itemType: "deal",
          name,
          variantName: null,
          dealId,
          dealChoices: choices,
          unitPrice,
          quantity: 1,
          notes: ""
        }
      ]
    }));
  },

  incrementLine(lineId) {
    set((state) => ({
      lines: state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + 1 } : l))
    }));
  },

  decrementLine(lineId) {
    set((state) => ({
      lines: state.lines
        .map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    }));
  },

  removeLine(lineId) {
    set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) }));
  },

  setNotes(lineId, notes) {
    set((state) => ({ lines: state.lines.map((l) => (l.lineId === lineId ? { ...l, notes } : l)) }));
  },

  clear() {
    set({ lines: [], resumingOrderId: null });
  },

  loadHeldOrder(orderId, lines) {
    set({ lines, resumingOrderId: orderId });
  },

  subtotal() {
    return get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  },

  toOrderItems(): OrderItemInput[] {
    return get().lines.map((l) => ({
      itemType: l.itemType,
      productId: l.productId,
      variantId: l.variantId,
      dealId: l.dealId,
      quantity: l.quantity,
      notes: l.notes || undefined,
      dealChoices: l.dealChoices?.map((c) => ({ slotId: c.slotId, productId: c.productId, variantId: c.variantId }))
    }));
  }
}));
