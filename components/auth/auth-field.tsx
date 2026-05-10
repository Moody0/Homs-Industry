import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  hint?: string;
  icon?: ReactNode;
  label: string;
  wrapperClassName?: string;
};

export function AuthField({ className, hint, icon, label, id, wrapperClassName, ...props }: AuthFieldProps) {
  return (
    <label className={cn("grid gap-2", wrapperClassName)} htmlFor={id}>
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-800">{label}</span>
        {hint ? <span className="text-xs font-bold text-slate-400">{hint}</span> : null}
      </span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          className={cn(
            "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10",
            icon ? "pr-11" : "",
            className,
          )}
          id={id}
          {...props}
        />
      </span>
    </label>
  );
}
