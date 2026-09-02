import { useEffect, useState } from "react";
import type { EmployeeSession } from "@shared/types";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { formatDateTime, formatPKR } from "@/lib/format";

type SessionRow = EmployeeSession & { userName: string };

export function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeOnly, setActiveOnly] = useState(false);

  async function load() {
    setSessions(await window.hkd.sessions.list({ activeOnly }));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  async function forceEnd(session: SessionRow) {
    await window.hkd.sessions.endById(session.id);
    load();
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="font-display text-xl tracking-wide text-hkd-cream">Employee Sessions</h1>
        <label className="flex items-center gap-2 text-hkd-cream/70">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="h-5 w-5" />
          Active only
        </label>
      </div>
      <p className="mb-4 max-w-2xl shrink-0 text-hkd-cream/50">
        A session's invoice count and sales run from its start until it is explicitly ended — midnight never splits or resets it.
      </p>

      <DataTable
        columns={[
          { header: "Employee", render: (s: SessionRow) => s.userName },
          { header: "Started", render: (s: SessionRow) => formatDateTime(s.startedAt) },
          { header: "Ended", render: (s: SessionRow) => (s.endedAt ? formatDateTime(s.endedAt) : <Badge tone="green">Active</Badge>) },
          { header: "Invoices", render: (s: SessionRow) => String(s.invoiceCount) },
          { header: "Sales", render: (s: SessionRow) => formatPKR(s.totalSales) },
          {
            header: "Actions",
            render: (s: SessionRow) =>
              !s.endedAt ? (
                <Button size="md" variant="danger" onClick={() => forceEnd(s)}>
                  Force End
                </Button>
              ) : null
          }
        ]}
        rows={sessions}
        keyFor={(s) => s.id}
      />
    </div>
  );
}
