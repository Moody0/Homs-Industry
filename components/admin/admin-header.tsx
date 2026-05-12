type AdminHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminHeader({ action, description, title }: AdminHeaderProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mb-6">
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black text-orange-600">الإدارة</p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0 md:text-left">{action}</div> : null}
      </div>
    </div>
  );
}
