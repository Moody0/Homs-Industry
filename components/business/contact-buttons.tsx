import { CallButton } from "@/components/business/call-button";
import { WhatsAppButton } from "@/components/business/whatsapp-button";
import { cn } from "@/lib/utils";

type ContactButtonsProps = {
  phone: string;
  whatsappPhone?: string | null;
  className?: string;
  businessId?: string;
};

export function ContactButtons({ phone, whatsappPhone, className, businessId }: ContactButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <CallButton businessId={businessId} phone={phone} />
      <WhatsAppButton businessId={businessId} phone={whatsappPhone || phone} />
    </div>
  );
}
