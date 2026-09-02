import { useEffect, useState } from "react";
import type { EmployeeSessionSummary } from "@shared/types";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { formatDateTime, formatPKR } from "@/lib/format";

export function Header() {
  const { user, logout, endSession } = useAuthStore();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [summary, setSummary] = useState<EmployeeSessionSummary | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!confirmEnd) return;
    setSummary(null);
    window.hkd.myStats.sessionSummary().then(setSummary);
  }, [confirmEnd]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-hkd-charcoal px-4">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-xl tracking-wide text-hkd-pink">HASHMI KA DERA</span>
        <span className="urdu-text text-lg text-hkd-yellow">ہاشمی کا ڈیرہ</span>
        <span className="rounded-md bg-hkd-yellow px-1.5 py-0.5 text-xs font-bold text-hkd-black">HKD</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold text-hkd-cream">{user?.fullName}</div>
          <div className="text-xs capitalize text-hkd-cream/60">{user?.role}</div>
        </div>
        <Button variant="secondary" size="md" onClick={() => logout()}>
          Log Out
        </Button>
        {user?.role === "employee" && (
          <Button variant="danger" size="md" onClick={() => setConfirmEnd(true)}>
            End Session
          </Button>
        )}
      </div>

      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title="Session Summary"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
              Keep Working
            </Button>
            <Button
              variant="danger"
              disabled={ending}
              onClick={async () => {
                setEnding(true);
                await endSession();
                setConfirmEnd(false);
                setEnding(false);
              }}
            >
              {ending ? "Ending…" : "End Session"}
            </Button>
          </div>
        }
      >
        {!summary && <p className="text-hkd-cream/60">Loading your session summary…</p>}
        {summary && (
          <div className="flex flex-col gap-2">
            <p className="text-hkd-cream/70">
              Session started {formatDateTime(summary.startedAt)}. Ending it closes out these totals for good — this cannot be undone.
            </p>
            <div className="mt-1 rounded-lg bg-white/5 p-3">
              <div className="flex justify-between">
                <span>Invoices</span>
                <span className="font-semibold text-hkd-cream">{summary.invoiceCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales</span>
                <span className="font-semibold text-hkd-yellow">{formatPKR(summary.sales)}</span>
              </div>
              {summary.cancelledCount > 0 && (
                <div className="flex justify-between">
                  <span>Cancelled Orders</span>
                  <span className="font-semibold text-red-400">{summary.cancelledCount}</span>
                </div>
              )}
            </div>
            {summary.paymentBreakdown.length > 0 && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-hkd-cream/50">Payment Breakdown</div>
                {summary.paymentBreakdown.map((p) => (
                  <div key={p.paymentMethod ?? "unknown"} className="flex justify-between capitalize">
                    <span>{p.paymentMethod ?? "Unspecified"}</span>
                    <span className="font-semibold text-hkd-cream">{formatPKR(p.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </header>
  );
}
