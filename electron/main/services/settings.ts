import type Database from "better-sqlite3";
import type { Settings } from "../../../shared/types";

export function getSettings(db: Database.Database): Settings {
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    serviceChargeDefault: Number(map.get("serviceChargeDefault") ?? "30"),
    businessDayStartHour: Number(map.get("businessDayStartHour") ?? "6"),
    printerName: map.get("printerName") || null,
    printerPaperWidthMm: (Number(map.get("printerPaperWidthMm") ?? "80") === 58 ? 58 : 80),
    restaurantNameEn: map.get("restaurantNameEn") ?? "HASHMI KA DERA — HKD",
    restaurantNameUr: map.get("restaurantNameUr") ?? "ہاشمی کا ڈیرہ",
    restaurantPhone: map.get("restaurantPhone") ?? ""
  };
}

export function setSetting(db: Database.Database, key: string, value: string): void {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    key,
    value
  );
}

export function updateSettings(db: Database.Database, partial: Partial<Settings>): Settings {
  const mapping: Record<string, string | undefined> = {
    serviceChargeDefault: partial.serviceChargeDefault?.toString(),
    businessDayStartHour: partial.businessDayStartHour?.toString(),
    printerName: partial.printerName ?? undefined,
    printerPaperWidthMm: partial.printerPaperWidthMm?.toString(),
    restaurantNameEn: partial.restaurantNameEn,
    restaurantNameUr: partial.restaurantNameUr,
    restaurantPhone: partial.restaurantPhone
  };
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(mapping)) {
      if (value !== undefined) setSetting(db, key, value);
    }
  });
  tx();
  return getSettings(db);
}
