import { useEffect, useState } from "react";
import type { EmployeeDashboardStats, PaymentBreakdownEntry, TopItemEntry } from "@shared/types";
import { StatTile } from "@/components/admin/StatTile";
import { Badge } from "@/components/common/Badge";
import { useAuthStore } from "@/store/authStore";
import { formatDateTime, formatPKR } from "@/lib/format";

function formatDuration(startedAt: string, nowMs: number): string {
  if (!startedAt) return "-";
  const iso = startedAt.includes("T") ? startedAt : startedAt.replace(" ", "T") + "Z";
  const diffMs = Math.max(0, nowMs - new Date(iso).getTime());
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export function EmployeeDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [sessionPayments, setSessionPayments] = useState<PaymentBreakdownEntry[]>([]);
  const [dayPayments, setDayPayments] = useState<PaymentBreakdownEntry[]>([]);
  const [sessionTop, setSessionTop] = useState<TopItemEntry[]>([]);
  const [dayTop, setDayTop] = useState<TopItemEntry[]>([]);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [s, sp, dp, st, dt] = await Promise.all([
        window.hkd.myStats.dashboard(),
        window.hkd.myStats.paymentBreakdown("session"),
        window.hkd.myStats.paymentBreakdown("businessDay"),
        window.hkd.myStats.topItems("session", 5),
        window.hkd.myStats.topItems("businessDay", 5)
      ]);
      setStats(s);
      setSessionPayments(sp);
      setDayPayments(dp);
      setSessionTop(st);
      setDayTop(dt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard");
    }
  }

  useEffect(() => {
    load();
    const statsInterval = setInterval(load, 30_000);
    const clockInterval = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(clockInterval);
    };
  }, []);

  if (error) {
    return <div className="p-4 text-hkd-cream/70">{error}</div>;
  }
  if (!stats) return null;

  return (
    <div className="min-h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl tracking-wide text-hkd-cream">Welcome, {user?.fullName}</h1>
          <p className="text-xs text-hkd-cream/50">Business date: {stats.businessDate}</p>
        </div>
        <Badge tone="green">Session Active</Badge>
      </div>

      <div className="mb-4 rounded-xl border border-hkd-green/30 bg-hkd-charcoal p-3 text-sm text-hkd-cream/80">
        Session started {formatDateTime(stats.session.startedAt)} · Duration {formatDuration(stats.session.startedAt, now)}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Today's Sales" value={formatPKR(stats.businessDay.sales)} accent="yellow" />
        <StatTile label="Today's Orders" value={String(stats.businessDay.invoiceCount)} accent="pink" />
        <StatTile label="Session Sales" value={formatPKR(stats.session.sales)} accent="yellow" />
        <StatTile label="Session Invoices" value={String(stats.session.invoiceCount)} accent="pink" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <PaymentPanel title="Payment Breakdown — This Session" entries={sessionPayments} />
        <PaymentPanel title="Payment Breakdown — Today" entries={dayPayments} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 pb-4">
        <TopItemsPanel title="Top Items — This Session" items={sessionTop} />
        <TopItemsPanel title="Top Items — Today" items={dayTop} />
      </div>
    </div>
  );
}

function PaymentPanel({ title, entries }: { title: string; entries: PaymentBreakdownEntry[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-hkd-charcoal p-3">
      <h3 className="mb-2 font-display text-sm text-hkd-yellow">{title}</h3>
      {entries.length === 0 && <p className="text-sm text-hkd-cream/40">No sales yet.</p>}
      <div className="flex flex-col gap-1">
        {entries.map((e) => (
          <div key={e.paymentMethod ?? "unknown"} className="flex justify-between text-sm text-hkd-cream/80">
            <span className="capitalize">{e.paymentMethod ?? "Unspecified"}</span>
            <span className="font-semibold text-hkd-cream">
              {formatPKR(e.total)} ({e.invoiceCount})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopItemsPanel({ title, items }: { title: string; items: TopItemEntry[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-hkd-charcoal p-3">
      <h3 className="mb-2 font-display text-sm text-hkd-yellow">{title}</h3>
      {items.length === 0 && <p className="text-sm text-hkd-cream/40">No items sold yet.</p>}
      <div className="flex flex-col gap-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex justify-between text-sm text-hkd-cream/80">
            <span>
              {it.name}
              {it.variant ? ` (${it.variant})` : ""}
            </span>
            <span className="font-semibold text-hkd-cream">{it.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
