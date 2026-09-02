import { useEffect, useState } from "react";
import type { Order } from "@shared/types";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { formatDateTime, formatPKR, todayISODate } from "@/lib/format";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState(todayISODate());
  const [to, setTo] = useState(todayISODate());
  const [detail, setDetail] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);
  const [reason, setReason] = useState("");

  async function load() {
    const rows = await window.hkd.orders.list({ businessDateFrom: from, businessDateTo: to });
    setOrders(rows);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function doCancel() {
    if (!cancelling) return;
    await window.hkd.orders.cancel(cancelling.id, reason || "No reason given");
    setCancelling(null);
    setReason("");
    load();
  }

  async function reprint(order: Order) {
    await window.hkd.printer.print(order.id, true);
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 font-display text-xl tracking-wide text-hkd-cream">Orders</h1>
      <div className="mb-4 flex shrink-0 items-end gap-4">
        <div>
          <label className="mb-1 block text-sm text-hkd-cream/60">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-hkd-cream" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-hkd-cream/60">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-hkd-cream" />
        </div>
        <Button size="md" variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      <DataTable
        columns={[
          { header: "Invoice", render: (o: Order) => o.orderNumber },
          { header: "Date", render: (o: Order) => formatDateTime(o.createdAt) },
          { header: "Employee", render: (o: Order) => o.employeeName },
          { header: "Status", render: (o: Order) => <Badge tone={o.status === "completed" ? "green" : o.status === "held" ? "yellow" : "red"}>{o.status}</Badge> },
          { header: "Payment", render: (o: Order) => o.paymentMethod ?? "-" },
          { header: "Grand Total", render: (o: Order) => formatPKR(o.grandTotal) },
          {
            header: "Actions",
            render: (o: Order) => (
              <div className="flex gap-2">
                <Button size="md" variant="secondary" onClick={() => setDetail(o)}>
                  View
                </Button>
                {o.status === "completed" && (
                  <Button size="md" variant="secondary" onClick={() => reprint(o)}>
                    Reprint
                  </Button>
                )}
                {o.status !== "cancelled" && (
                  <Button size="md" variant="danger" onClick={() => setCancelling(o)}>
                    Cancel
                  </Button>
                )}
              </div>
            )
          }
        ]}
        rows={orders}
        keyFor={(o) => o.id}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.orderNumber ?? ""} wide>
        {detail && (
          <div className="flex flex-col gap-2">
            <div className="text-hkd-cream/70">
              {formatDateTime(detail.createdAt)} • {detail.employeeName} • {detail.status}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {detail.items.map((item) => (
                <div key={item.id} className="rounded-lg bg-white/5 p-3">
                  <div className="flex justify-between font-semibold text-hkd-cream">
                    <span>
                      {item.quantity}x {item.nameSnapshot} {item.variantSnapshot ? `(${item.variantSnapshot})` : ""}
                    </span>
                    <span>{formatPKR(item.lineTotal)}</span>
                  </div>
                  {item.dealChoicesSnapshot?.map((c, idx) => (
                    <div key={idx} className="pl-3 text-sm text-hkd-cream/50">
                      {c.label}: {c.productName} {c.variantName}
                    </div>
                  ))}
                  {item.notes && <div className="pl-3 text-sm italic text-hkd-cream/50">Note: {item.notes}</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3 text-right">
              <div>Subtotal: {formatPKR(detail.subtotal)}</div>
              <div>Service Charges: {formatPKR(detail.serviceCharge)}</div>
              <div className="text-xl font-bold text-hkd-yellow">Grand Total: {formatPKR(detail.grandTotal)}</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title="Cancel Order"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Back
            </Button>
            <Button variant="danger" onClick={doCancel}>
              Confirm Cancel
            </Button>
          </div>
        }
      >
        <label className="mb-1 block text-sm text-hkd-cream/60">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-hkd-black px-3 py-2 text-sm text-hkd-cream outline-none focus:border-hkd-pink"
          rows={3}
        />
      </Modal>
    </div>
  );
}
