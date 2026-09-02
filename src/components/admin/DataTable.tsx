import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, keyFor, emptyMessage = "No records found." }: Props<T>) {
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-hkd-panel">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-hkd-cream/70">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-hkd-cream/50">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={keyFor(row)} className="border-t border-white/5 hover:bg-white/5">
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-2 text-hkd-cream/90 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
