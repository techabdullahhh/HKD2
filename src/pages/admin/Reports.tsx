import { useEffect, useState } from "react";
import { StatTile } from "@/components/admin/StatTile";
import { Button } from "@/components/common/Button";
import { formatPKR, todayISODate } from "@/lib/format";
import type { SalesSummary } from "@shared/types";

type ReportKey =
  | "byBusinessDate"
  | "byEmployee"
  | "products"
  | "categories"
  | "pizzaSizes"
  | "deals"
  | "paymentMethods"
  | "cancellations";

const TABS: { key: ReportKey; label: string }[] = [
  { key: "byBusinessDate", label: "Business Date" },
  { key: "byEmployee", label: "Employee" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "pizzaSizes", label: "Pizza Sizes" },
  { key: "deals", label: "Deals" },
  { key: "paymentMethods", label: "Payment Methods" },
  { key: "cancellations", label: "Cancellations" }
];

function GenericTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <p className="text-hkd-cream/50">No data for this range.</p>;
  const columns = Object.keys(rows[0]);
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-hkd-panel">
          <tr>
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-hkd-cream/70">
                {c.replace(/([A-Z])/g, " $1")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
              {columns.map((c) => (
                <td key={c} className="px-3 py-2 text-sm text-hkd-cream/90">
                  {typeof row[c] === "number" && /total|revenue|sales|amount/i.test(c) ? formatPKR(row[c] as number) : String(row[c] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportsPage() {
  const [tab, setTab] = useState<ReportKey>("byBusinessDate");
  const [from, setFrom] = useState(todayISODate());
  const [to, setTo] = useState(todayISODate());
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  async function load() {
    const range = { from, to };
    const [s, r] = await Promise.all([window.hkd.reports.summary(range), window.hkd.reports[tab](range)]);
    setSummary(s);
    setRows(r as Record<string, unknown>[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, from, to]);

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 shrink-0 font-display text-xl tracking-wide text-hkd-cream">Reports</h1>

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

      <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Invoices" value={String(summary?.invoiceCount ?? 0)} />
        <StatTile label="Subtotal" value={formatPKR(summary?.subtotal ?? 0)} accent="yellow" />
        <StatTile label="Service Charges" value={formatPKR(summary?.serviceCharge ?? 0)} accent="green" />
        <StatTile label="Grand Total" value={formatPKR(summary?.grandTotal ?? 0)} />
      </div>

      <div className="mb-4 flex shrink-0 flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2.5 font-semibold ${tab === t.key ? "bg-hkd-pink text-white" : "bg-white/5 text-hkd-cream/70 hover:bg-white/10"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <GenericTable rows={rows} />
    </div>
  );
}
