interface Props {
  label: string;
  value: string;
  accent?: "pink" | "yellow" | "green";
}

const accentClasses = {
  pink: "text-hkd-pink",
  yellow: "text-hkd-yellow",
  green: "text-hkd-green"
};

export function StatTile({ label, value, accent = "pink" }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-hkd-charcoal p-3.5 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-hkd-cream/60">{label}</div>
      <div className={`mt-1 font-display text-xl ${accentClasses[accent]}`}>{value}</div>
    </div>
  );
}
