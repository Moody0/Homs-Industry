import type { InputHTMLAttributes } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadImageFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export function UploadImageField({ className, description, id, label, ...props }: UploadImageFieldProps) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      <span className={cn("flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-600 transition hover:border-orange-300 hover:bg-orange-50", className)}>
        <UploadCloud aria-hidden className="mb-2 size-7 text-orange-500" />
        {description ?? "اسحب الصور أو اخترها من جهازك"}
        <input accept="image/jpeg,image/png,image/webp" className="sr-only" id={id} type="file" {...props} />
      </span>
    </label>
  );
}
