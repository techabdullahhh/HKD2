import { useState } from "react";
import { Button } from "@/components/common/Button";

export function BackupPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function doExport() {
    const result = await window.hkd.backup.export();
    setMessage(result ? `Backup saved to: ${result.path}` : "Backup cancelled.");
  }

  async function doImport() {
    const result = await window.hkd.backup.import();
    if (result) setMessage("Restoring and restarting the application…");
    else setMessage("Restore cancelled.");
  }

  return (
    <div className="max-w-xl p-4">
      <h1 className="mb-4 font-display text-xl tracking-wide text-hkd-cream">Backup &amp; Restore</h1>

      <div className="mb-8 rounded-2xl border border-white/10 bg-hkd-charcoal p-5">
        <h2 className="mb-2 font-display text-xl text-hkd-yellow">Backup Database</h2>
        <p className="mb-4 text-hkd-cream/60">Saves a full copy of all menu, employee, session, and sales data to a file you choose.</p>
        <Button onClick={doExport}>Export Backup</Button>
      </div>

      <div className="rounded-2xl border border-red-500/30 bg-hkd-charcoal p-5">
        <h2 className="mb-2 font-display text-xl text-red-400">Restore Database</h2>
        <p className="mb-4 text-hkd-cream/60">
          Replaces ALL current data with a previously exported backup file and restarts the app. This cannot be undone — make sure
          you really want to do this.
        </p>
        <Button variant="danger" onClick={doImport}>
          Restore From Backup…
        </Button>
      </div>

      {message && <p className="mt-5 text-hkd-cream/70">{message}</p>}
    </div>
  );
}
