"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { DashboardActionState } from "@/actions/dashboard";
import { cn } from "@/lib/utils";

type DashboardAction = (
  previousState: DashboardActionState,
  formData: FormData,
) => Promise<DashboardActionState>;

const initialState: DashboardActionState = { message: "" };

export function DashboardActionForm({
  action,
  children,
  className,
}: {
  action: DashboardAction;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      {children}
      {state.message ? (
        <p
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-bold",
            state.success ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function DashboardSubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-black text-white disabled:opacity-70" disabled={pending} type="submit">
      {pending ? "جار الحفظ..." : children}
    </button>
  );
}
