import { ContactButtons } from "@/components/business/contact-buttons";

type StickyContactBarProps = {
  phone: string;
  whatsappPhone?: string | null;
};

export function StickyContactBar({ phone, whatsappPhone }: StickyContactBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white p-3 md:hidden">
      <ContactButtons className="grid grid-cols-2" phone={phone} whatsappPhone={whatsappPhone} />
    </div>
  );
}
