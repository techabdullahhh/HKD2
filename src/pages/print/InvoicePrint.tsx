import { useEffect, useState } from "react";
import type { Order, Settings } from "@shared/types";
import { ReceiptView } from "@/components/print/ReceiptView";

export function InvoicePrintPage({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    Promise.all([window.hkd.orders.get(orderId), window.hkd.settings.get()]).then(([o, s]) => {
      setOrder(o);
      setSettings(s);
    });
  }, [orderId]);

  useEffect(() => {
    if (order && settings) {
      requestAnimationFrame(() => window.hkdPrint.ready());
    }
  }, [order, settings]);

  if (!order || !settings) return null;

  return <ReceiptView order={order} settings={settings} />;
}
