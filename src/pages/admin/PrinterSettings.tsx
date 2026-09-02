import { useEffect, useState } from "react";
import type { PrinterInfoDTO } from "@shared/api";
import type { Settings } from "@shared/types";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

export function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<PrinterInfoDTO[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    const [p, s] = await Promise.all([window.hkd.printer.list(), window.hkd.settings.get()]);
    setPrinters(p);
    setSettings(s);
  }

  useEffect(() => {
    load();
  }, []);

  async function selectPrinter(name: string) {
    const updated = await window.hkd.settings.update({ printerName: name });
    setSettings(updated);
  }

  async function setPaperWidth(width: 58 | 80) {
    const updated = await window.hkd.settings.update({ printerPaperWidthMm: width });
    setSettings(updated);
  }

  async function testPrint() {
    setStatus("Printing test page not available without a completed invoice — print any invoice from Orders to verify.");
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-xl tracking-wide text-hkd-cream">Printer Settings</h1>
      <p className="mb-6 max-w-2xl text-hkd-cream/50">
        Wired/USB system printers only. Select the printer once here — employees never need to choose a printer at the register.
      </p>

      <div className="mb-6">
        <h2 className="mb-2 font-display text-xl text-hkd-yellow">Paper Width</h2>
        <div className="flex gap-3">
          {[58, 80].map((w) => (
            <button
              key={w}
              onClick={() => setPaperWidth(w as 58 | 80)}
              className={`rounded-xl border-2 px-6 py-3 font-bold ${
                settings?.printerPaperWidthMm === w ? "border-hkd-pink bg-hkd-pink/20 text-white" : "border-white/10 text-hkd-cream/70"
              }`}
            >
              {w}mm
            </button>
          ))}
        </div>
      </div>

      <h2 className="mb-2 font-display text-xl text-hkd-yellow">Available Printers</h2>
      <Button size="md" variant="secondary" className="mb-3" onClick={load}>
        Refresh List
      </Button>
      <div className="flex flex-col gap-2">
        {printers.length === 0 && <p className="text-hkd-cream/50">No system printers detected. Connect and power on your wired thermal printer, then refresh.</p>}
        {printers.map((p) => (
          <button
            key={p.name}
            onClick={() => selectPrinter(p.name)}
            className={`flex items-center justify-between rounded-xl border p-4 text-left ${
              settings?.printerName === p.name ? "border-hkd-pink bg-hkd-pink/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div>
              <div className="font-semibold text-hkd-cream">{p.displayName || p.name}</div>
              {p.isDefault && <span className="text-sm text-hkd-cream/50">System default</span>}
            </div>
            {settings?.printerName === p.name && <Badge tone="green">Selected</Badge>}
          </button>
        ))}
      </div>

      <Button className="mt-6" onClick={testPrint} variant="secondary">
        How do I test this?
      </Button>
      {status && <p className="mt-3 text-hkd-cream/60">{status}</p>}
    </div>
  );
}
