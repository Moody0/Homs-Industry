type AdminHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminHeader({ action, description, title }: AdminHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-black text-orange-600">الإدارة</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
