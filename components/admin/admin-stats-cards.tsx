type AdminStat = {
  label: string;
  value: string | number;
  description?: string;
};

export function AdminStatsCards({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:p-5" key={stat.label}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-black text-slate-500">{stat.label}</p>
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-orange-50 text-xs font-black text-orange-600">{index + 1}</span>
          </div>
          <p className="mt-3 text-3xl font-black leading-none text-slate-950 sm:text-4xl">{stat.value}</p>
          {stat.description ? <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{stat.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
