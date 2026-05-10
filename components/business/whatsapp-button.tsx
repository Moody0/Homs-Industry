"use client";

import { MessageCircle } from "lucide-react";
import { trackBusinessEvent } from "@/components/business/analytics-event";

type WhatsAppButtonProps = {
  phone: string;
  className?: string;
  businessId?: string;
};

function cleanWhatsApp(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function WhatsAppButton({ phone, className, businessId }: WhatsAppButtonProps) {
  return (
    <a className={className ?? "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600"} href={`https://wa.me/${cleanWhatsApp(phone)}`} rel="noreferrer" target="_blank" onClick={() => trackBusinessEvent(businessId, "whatsapp")}>
      <MessageCircle aria-hidden className="size-4" />
      واتساب
    </a>
  );
}
