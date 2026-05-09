import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          {description ? (
            <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
