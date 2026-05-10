import { ContactButtons } from "@/components/business/contact-buttons";

type StickyContactBarProps = {
  phone: string;
  whatsappPhone?: string | null;
  businessId?: string;
};

export function StickyContactBar({ phone, whatsappPhone, businessId }: StickyContactBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white p-3 md:hidden">
      <ContactButtons businessId={businessId} className="grid grid-cols-2" phone={phone} whatsappPhone={whatsappPhone} />
    </div>
  );
}
