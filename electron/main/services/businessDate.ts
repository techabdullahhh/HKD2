/**
 * Business date is a reporting concept independent of employee sessions
 * (spec: a business day can cross midnight, e.g. 6PM -> 6AM next calendar day
 * belongs to a single business date). It is derived from a configurable
 * "day start hour" — everything before that hour on a calendar day still
 * belongs to the previous business date.
 */
export function computeBusinessDate(when: Date, businessDayStartHour: number): string {
  const d = new Date(when.getTime());
  if (d.getHours() < businessDayStartHour) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
