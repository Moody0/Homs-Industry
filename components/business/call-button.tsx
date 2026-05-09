import { Phone } from "lucide-react";

type CallButtonProps = {
  phone: string;
  className?: string;
};

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function CallButton({ phone, className }: CallButtonProps) {
  return (
    <a className={className ?? "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"} href={`tel:${cleanPhone(phone)}`}>
      <Phone aria-hidden className="size-4" />
      اتصال
    </a>
  );
}
