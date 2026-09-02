import { ReactNode } from "react";

type Tone = "pink" | "yellow" | "green" | "gray" | "red";

const toneClasses: Record<Tone, string> = {
  pink: "bg-hkd-pink/20 text-hkd-pink border-hkd-pink/40",
  yellow: "bg-hkd-yellow/20 text-hkd-yellow border-hkd-yellow/40",
  green: "bg-hkd-green/20 text-hkd-green border-hkd-green/40",
  gray: "bg-white/10 text-hkd-cream/70 border-white/20",
  red: "bg-red-500/20 text-red-400 border-red-500/40"
};

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
