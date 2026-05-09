import type { ReactNode } from "react";

type AdminTableProps = {
  headers: string[];
  rows: ReactNode[][];
  emptyText?: string;
};

export function AdminTable({ emptyText = "لا توجد بيانات", headers, rows }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{headers.map((header) => <th className="px-4 py-3 text-right font-black" key={header}>{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td className="px-4 py-3" key={cellIndex}>{cell}</td>)}</tr>) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={headers.length}>{emptyText}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
