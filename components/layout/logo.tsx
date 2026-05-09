import Link from "next/link";
import { Factory } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function Logo({ className, tone = "light" }: LogoProps) {
  return (
    <Link className={cn("inline-flex items-center gap-3", className)} href="/">
      <span className="grid size-11 place-items-center rounded-full bg-orange-500 text-white">
        <Factory aria-hidden className="size-6" strokeWidth={2.5} />
      </span>
      <span className={cn("text-2xl font-black tracking-tight", tone === "light" ? "text-white" : "text-slate-950")}>
        صناعة <span className="text-orange-400">حمص</span>
      </span>
    </Link>
  );
}
