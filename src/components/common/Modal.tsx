import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={`flex max-h-[90vh] w-full ${wide ? "max-w-3xl" : "max-w-lg"} flex-col rounded-2xl border border-white/10 bg-hkd-charcoal shadow-card`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="font-display text-lg tracking-wide text-hkd-yellow">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-xl text-hkd-cream/70 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 text-sm">{children}</div>
        {footer && <div className="shrink-0 border-t border-white/10 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
