type AdminStat = {
  label: string;
  value: string | number;
  description?: string;
};

export function AdminStatsCards({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
          <p className="text-sm font-bold text-slate-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{stat.value}</p>
          {stat.description ? <p className="mt-1 text-xs text-slate-500">{stat.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
