import type { ReactNode } from "react";
import { CallButton } from "@/components/business/call-button";
import { WhatsAppButton } from "@/components/business/whatsapp-button";
import { cn } from "@/lib/utils";

type ContactButtonsProps = {
  phone: string;
  whatsappPhone?: string | null;
  className?: string;
  businessId?: string;
  buttonClassName?: string;
  children?: ReactNode;
};

export function ContactButtons({ phone, whatsappPhone, className, businessId, buttonClassName, children }: ContactButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <CallButton
        businessId={businessId}
        className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800", buttonClassName)}
        phone={phone}
      />
      <WhatsAppButton
        businessId={businessId}
        className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600", buttonClassName)}
        phone={whatsappPhone || phone}
      />
      {children}
    </div>
  );
}
