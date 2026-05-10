"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackBusinessEvent } from "@/components/business/analytics-event";

type AnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  businessId: string;
  eventKind: "directions" | "profile";
  children: ReactNode;
};

export function AnalyticsLink({ businessId, eventKind, children, onClick, ...props }: AnalyticsLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackBusinessEvent(businessId, eventKind);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
