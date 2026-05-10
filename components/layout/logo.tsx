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
      <span className="grid size-10 place-items-center rounded-full bg-orange-500 text-white md:size-11">
        <Factory aria-hidden className="size-5 md:size-6" strokeWidth={2.5} />
      </span>
      <span className={cn("text-xl font-black tracking-tight md:text-2xl", tone === "light" ? "text-white" : "text-slate-950")}>
        صناعة <span className="text-orange-400">حمص</span>
      </span>
    </Link>
  );
}
