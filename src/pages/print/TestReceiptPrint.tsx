import { useEffect, useState } from "react";
import type { Settings } from "@shared/types";
import { TestReceiptView } from "@/components/print/TestReceiptView";

export function TestReceiptPrintPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    window.hkd.settings.get().then(setSettings);
  }, []);

  useEffect(() => {
    if (settings) {
      requestAnimationFrame(() => window.hkdPrint.ready());
    }
  }, [settings]);

  if (!settings) return null;

  return <TestReceiptView settings={settings} />;
}
