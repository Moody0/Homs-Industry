import type { ReactNode } from "react";

type AdminTableProps = {
  headers: string[];
  rows: ReactNode[][];
  emptyText?: string;
};

export function AdminTable({ emptyText = "لا توجد بيانات", headers, rows }: AdminTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-3 p-3 md:hidden">
        {rows.length > 0 ? rows.map((row, index) => (
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={index}>
            {row.map((cell, cellIndex) => (
              <div className="grid gap-1 border-b border-slate-100 px-3 py-3 last:border-b-0" key={cellIndex}>
                <p className="text-[11px] font-black text-slate-400">{headers[cellIndex]}</p>
                <div className="min-w-0 break-words text-sm text-slate-800">{cell}</div>
              </div>
            ))}
          </article>
        )) : (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-slate-500">{emptyText}</div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{headers.map((header) => <th className="whitespace-nowrap px-4 py-3 text-right font-black" key={header}>{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? rows.map((row, index) => (
              <tr className="align-top transition hover:bg-slate-50/70" key={index}>
                {row.map((cell, cellIndex) => <td className="px-4 py-3" key={cellIndex}>{cell}</td>)}
              </tr>
            )) : <tr><td className="px-4 py-10 text-center text-sm font-bold text-slate-500" colSpan={headers.length}>{emptyText}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
