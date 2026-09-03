import { useEffect, useState } from "react";
import type { Order, Settings } from "@shared/types";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { ReceiptView } from "@/components/print/ReceiptView";

interface Props {
  orderId: number | null;
  onClose: () => void;
}

export function ReceiptPreviewModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setPrintStatus(null);
      return;
    }
    Promise.all([window.hkd.orders.get(orderId), window.hkd.settings.get()]).then(([o, s]) => {
      setOrder(o);
      setSettings(s);
    });
  }, [orderId]);

  async function handlePrint() {
    if (!orderId) return;
    setPrinting(true);
    setPrintStatus(null);
    try {
      await window.hkd.printer.print(orderId, true);
      setPrintStatus("Sent to printer.");
    } catch (err) {
      setPrintStatus(err instanceof Error ? err.message : "Print failed.");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Modal
      open={!!orderId}
      onClose={onClose}
      title={order ? `Invoice ${order.orderNumber}` : "Invoice"}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-hkd-cream/60">{printStatus}</span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
            <Button variant="primary" disabled={!order || printing} onClick={handlePrint}>
              {printing ? "Printing…" : "Print"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex justify-center rounded-xl bg-black/30 p-4">
        {order && settings ? <ReceiptView order={order} settings={settings} /> : <p className="text-hkd-cream/60">Loading…</p>}
      </div>
    </Modal>
  );
}
