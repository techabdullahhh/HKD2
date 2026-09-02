import { useEffect, useState } from "react";
import type { Order } from "@shared/types";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { formatDateTime, formatPKR, todayISODate } from "@/lib/format";

export function MySalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(todayISODate());
  const [to, setTo] = useState(todayISODate());
  const [detail, setDetail] = useState<Order | null>(null);
  const [printing, setPrinting] = useState<number | null>(null);

  async function load() {
    const rows = await window.hkd.myOrders.list({ search: search || undefined, from, to });
    setOrders(rows);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function reprint(order: Order) {
    setPrinting(order.id);
    try {
      await window.hkd.printer.print(order.id, true);
    } finally {
      setPrinting(null);
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-3 font-display text-xl tracking-wide text-hkd-cream">My Sales</h1>

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs text-hkd-cream/60">Search invoice #</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="e.g. HKD-000123"
            className="w-full rounded-lg border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream outline-none focus:border-hkd-pink"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-hkd-cream/60">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-hkd-cream/60">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream" />
        </div>
        <Button size="md" variant="secondary" onClick={load}>
          Search
        </Button>
      </div>

      <DataTable
        columns={[
          { header: "Invoice", render: (o: Order) => o.orderNumber },
          { header: "Date", render: (o: Order) => formatDateTime(o.createdAt) },
          {
            header: "Status",
            render: (o: Order) => (
              <Badge tone={o.status === "completed" ? "green" : o.status === "held" ? "yellow" : "red"}>{o.status}</Badge>
            )
          },
          { header: "Payment", render: (o: Order) => o.paymentMethod ?? "-" },
          { header: "Service Charge", render: (o: Order) => formatPKR(o.serviceCharge) },
          { header: "Grand Total", render: (o: Order) => formatPKR(o.grandTotal) },
          {
            header: "Actions",
            render: (o: Order) => (
              <div className="flex gap-2">
                <Button size="md" variant="secondary" onClick={() => setDetail(o)}>
                  View
                </Button>
                {o.status === "completed" && (
                  <Button size="md" variant="secondary" disabled={printing === o.id} onClick={() => reprint(o)}>
                    {printing === o.id ? "Printing…" : "Reprint"}
                  </Button>
                )}
              </div>
            )
          }
        ]}
        rows={orders}
        keyFor={(o) => o.id}
        emptyMessage="No invoices found for this range."
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.orderNumber ?? ""} wide>
        {detail && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-hkd-cream/70">
              {formatDateTime(detail.createdAt)} · {detail.status} · {detail.paymentMethod ?? "no payment yet"}
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {detail.items.map((item) => (
                <div key={item.id} className="rounded-lg bg-white/5 p-3">
                  <div className="flex justify-between text-sm font-semibold text-hkd-cream">
                    <span>
                      {item.quantity}x {item.nameSnapshot} {item.variantSnapshot ? `(${item.variantSnapshot})` : ""}
                    </span>
                    <span>{formatPKR(item.lineTotal)}</span>
                  </div>
                  {item.dealChoicesSnapshot?.map((c, idx) => (
                    <div key={idx} className="pl-3 text-xs text-hkd-cream/50">
                      {c.label}: {c.productName} {c.variantName}
                    </div>
                  ))}
                  {item.notes && <div className="pl-3 text-xs italic text-hkd-cream/50">Note: {item.notes}</div>}
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-white/10 pt-2 text-right text-sm">
              <div>Subtotal: {formatPKR(detail.subtotal)}</div>
              <div>Service Charges: {formatPKR(detail.serviceCharge)}</div>
              <div className="text-lg font-bold text-hkd-yellow">Grand Total: {formatPKR(detail.grandTotal)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
