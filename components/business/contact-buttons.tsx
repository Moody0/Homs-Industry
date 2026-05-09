import { CallButton } from "@/components/business/call-button";
import { WhatsAppButton } from "@/components/business/whatsapp-button";
import { cn } from "@/lib/utils";

type ContactButtonsProps = {
  phone: string;
  whatsappPhone?: string | null;
  className?: string;
};

export function ContactButtons({ phone, whatsappPhone, className }: ContactButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <CallButton phone={phone} />
      <WhatsAppButton phone={whatsappPhone || phone} />
    </div>
  );
}
