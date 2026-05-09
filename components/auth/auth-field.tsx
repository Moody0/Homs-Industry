import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AuthField({ className, label, id, ...props }: AuthFieldProps) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input
        className={cn(
          "h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10",
          className,
        )}
        id={id}
        {...props}
      />
    </label>
  );
}
