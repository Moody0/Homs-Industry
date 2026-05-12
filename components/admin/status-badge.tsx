import { cn } from "@/lib/utils";

const variants = {
  active: "bg-green-50 text-green-700 ring-green-200",
  approved: "bg-green-50 text-green-700 ring-green-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
} as const;

type StatusBadgeProps = {
  status: keyof typeof variants | string;
  children?: React.ReactNode;
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const key = status in variants ? (status as keyof typeof variants) : "inactive";
  return <span className={cn("inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-black ring-1 ring-inset", variants[key])}>{children ?? status}</span>;
}
