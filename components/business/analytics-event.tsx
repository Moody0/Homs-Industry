"use client";

import { useEffect } from "react";

type AnalyticsEventKind = "view" | "call" | "whatsapp" | "directions" | "profile";

export function trackBusinessEvent(businessId: string | undefined, eventKind: AnalyticsEventKind) {
  if (!businessId) return;
  const payload = JSON.stringify({ businessId, eventKind });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/business-event", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics/business-event", {
    body: payload,
    headers: { "Content-Type": "application/json" },
    method: "POST",
    keepalive: true,
  });
}

export function BusinessViewTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    trackBusinessEvent(businessId, "view");
  }, [businessId]);

  return null;
}
