import { MessageCircle } from "lucide-react";

type WhatsAppButtonProps = {
  phone: string;
  className?: string;
};

function cleanWhatsApp(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function WhatsAppButton({ phone, className }: WhatsAppButtonProps) {
  return (
    <a className={className ?? "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-black text-white transition hover:bg-orange-600"} href={`https://wa.me/${cleanWhatsApp(phone)}`} rel="noreferrer" target="_blank">
      <MessageCircle aria-hidden className="size-4" />
      واتساب
    </a>
  );
}
