import { useEffect, useState } from "react";
import { StatTile } from "@/components/admin/StatTile";
import { formatPKR, todayISODate } from "@/lib/format";
import type { SalesSummary } from "@shared/types";

export function DashboardPage() {
  const [today, setToday] = useState<SalesSummary | null>(null);
  const [activeSessions, setActiveSessions] = useState<number>(0);

  useEffect(() => {
    const date = todayISODate();
    window.hkd.reports.summary({ from: date, to: date }).then((r) => setToday(r as SalesSummary));
    window.hkd.sessions.list({ activeOnly: true }).then((s) => setActiveSessions(s.length));
  }, []);

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-xl tracking-wide text-hkd-cream">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Today's Invoices" value={String(today?.invoiceCount ?? 0)} accent="pink" />
        <StatTile label="Today's Revenue" value={formatPKR(today?.grandTotal ?? 0)} accent="yellow" />
        <StatTile label="Service Charges Collected" value={formatPKR(today?.serviceCharge ?? 0)} accent="green" />
        <StatTile label="Active Sessions" value={String(activeSessions)} accent="pink" />
      </div>
      <p className="mt-6 max-w-2xl text-hkd-cream/50">
        Business date resets according to your configured business-day start hour, not midnight — see General Settings.
      </p>
    </div>
  );
}
