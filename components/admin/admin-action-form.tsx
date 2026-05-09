"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { initialAdminActionState, type AdminActionResult } from "@/lib/admin/action-result";
import { cn } from "@/lib/utils";

type AdminAction = (
  previousState: AdminActionResult,
  formData: FormData,
) => Promise<AdminActionResult>;

type AdminActionFormProps = {
  action: AdminAction;
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
  encType?: "multipart/form-data";
};

export function AdminActionForm({ action, children, className, confirmMessage, encType }: AdminActionFormProps) {
  const [state, formAction] = useActionState(action, initialAdminActionState);

  return (
    <form
      action={formAction}
      className={className}
      encType={encType}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
      {state.message ? (
        <p
          className={cn(
            "mt-2 rounded-md border px-3 py-2 text-xs font-bold",
            state.success ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AdminSubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? "جار الحفظ..." : children}
    </button>
  );
}
