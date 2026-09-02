import { useEffect, useState } from "react";
import type { Order } from "@shared/types";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { formatDateTime, formatPKR } from "@/lib/format";
import { useCartStore, type CartLine } from "@/store/cartStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

function orderToCartLines(order: Order): CartLine[] {
  return order.items.map((item) => ({
    lineId: `held-${item.id}`,
    itemType: item.itemType,
    name: item.nameSnapshot,
    variantName: item.variantSnapshot,
    productId: item.productId ?? undefined,
    variantId: item.variantId ?? undefined,
    dealId: item.dealId ?? undefined,
    dealChoices: item.dealChoicesSnapshot?.map((c, idx) => ({
      slotId: idx,
      productId: 0,
      variantId: 0,
      label: c.label,
      productName: c.productName,
      variantName: c.variantName
    })),
    unitPrice: item.unitPriceSnapshot,
    quantity: item.quantity,
    notes: item.notes ?? ""
  }));
}

export function HeldOrdersModal({ open, onClose }: Props) {
  const [heldOrders, setHeldOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const loadHeldOrder = useCartStore((s) => s.loadHeldOrder);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    window.hkd.orders
      .listHeld()
      .then(setHeldOrders)
      .finally(() => setLoading(false));
  }, [open]);

  function resume(order: Order) {
    loadHeldOrder(order.id, orderToCartLines(order));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Held Orders" wide>
      {loading && <p className="text-hkd-cream/60">Loading…</p>}
      {!loading && heldOrders.length === 0 && <p className="text-hkd-cream/60">No held orders right now.</p>}
      <div className="flex flex-col gap-3">
        {heldOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <div className="font-bold text-hkd-cream">{order.orderNumber}</div>
              <div className="text-sm text-hkd-cream/50">
                {formatDateTime(order.createdAt)} • {order.items.length} item(s) • {order.employeeName}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-hkd-yellow">{formatPKR(order.subtotal)}</div>
              <Button size="md" onClick={() => resume(order)}>
                Resume
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
