import { useEffect, useState } from "react";
import type { AuditLogEntry } from "@shared/types";
import { DataTable } from "@/components/admin/DataTable";
import { formatDateTime } from "@/lib/format";

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    window.hkd.audit.list({ limit: 500 }).then(setLogs);
  }, []);

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 shrink-0 font-display text-xl tracking-wide text-hkd-cream">Audit Log</h1>
      <DataTable
        columns={[
          { header: "When", render: (l: AuditLogEntry) => formatDateTime(l.createdAt) },
          { header: "User", render: (l: AuditLogEntry) => l.userName ?? "System" },
          { header: "Action", render: (l: AuditLogEntry) => l.action.replace(/_/g, " ") },
          { header: "Entity", render: (l: AuditLogEntry) => `${l.entityType}${l.entityId ? ` #${l.entityId}` : ""}` },
          { header: "Details", render: (l: AuditLogEntry) => <span className="text-sm text-hkd-cream/50">{l.details ?? "-"}</span> }
        ]}
        rows={logs}
        keyFor={(l) => l.id}
      />
    </div>
  );
}
