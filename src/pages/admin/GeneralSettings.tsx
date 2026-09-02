import { useEffect, useState } from "react";
import type { Settings } from "@shared/types";
import { Button } from "@/components/common/Button";

export function GeneralSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.hkd.settings.get().then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    const updated = await window.hkd.settings.update(settings);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) return null;

  return (
    <div className="max-w-xl p-4">
      <h1 className="mb-4 font-display text-xl tracking-wide text-hkd-cream">General Settings</h1>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Service Charge (PKR, fixed amount)</label>
          <input
            value={settings.serviceChargeDefault}
            onChange={(e) => setSettings({ ...settings, serviceChargeDefault: Number(e.target.value.replace(/[^0-9]/g, "")) })}
            className="w-full rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream"
          />
          <p className="mt-1 text-xs text-hkd-cream/40">Applied as a flat amount to new invoices. Past invoices keep whatever charge was applied at the time.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Business Day Start Hour (0–23)</label>
          <input
            value={settings.businessDayStartHour}
            onChange={(e) => setSettings({ ...settings, businessDayStartHour: Math.min(23, Number(e.target.value.replace(/[^0-9]/g, "")) || 0) })}
            className="w-full rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream"
          />
          <p className="mt-1 text-xs text-hkd-cream/40">
            Reporting/business date rolls over at this hour, not at midnight. E.g. 6 means 6PM–5:59AM the next day still counts as one
            business date. This is independent from employee work sessions, which never auto-close.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Restaurant Name (English)</label>
          <input
            value={settings.restaurantNameEn}
            onChange={(e) => setSettings({ ...settings, restaurantNameEn: e.target.value })}
            className="w-full rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Restaurant Name (Urdu)</label>
          <input
            value={settings.restaurantNameUr}
            onChange={(e) => setSettings({ ...settings, restaurantNameUr: e.target.value })}
            dir="rtl"
            className="urdu-text w-full rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-hkd-cream/70">Phone Number(s)</label>
          <input
            value={settings.restaurantPhone}
            onChange={(e) => setSettings({ ...settings, restaurantPhone: e.target.value })}
            className="w-full rounded-xl border border-white/15 bg-hkd-charcoal px-3 py-2 text-sm text-hkd-cream"
          />
        </div>

        <Button onClick={save}>{saved ? "Saved ✓" : "Save Settings"}</Button>
      </div>
    </div>
  );
}
