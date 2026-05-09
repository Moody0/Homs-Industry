import { Clock3 } from "lucide-react";
import { BusinessCard } from "@/components/business/business-card";
import { ButtonLink } from "@/components/ui/button";
import type { BusinessSummary } from "@/lib/data/marketplace";

export function LatestBusinesses({ businesses }: { businesses: BusinessSummary[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950"><Clock3 aria-hidden className="size-5 text-slate-950" /> أحدث المحلات</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {businesses.map((business) => <BusinessCard business={business} key={business.id} />)}
      </div>
      <div className="mt-5 flex justify-center"><ButtonLink href="/search" variant="secondary" className="min-w-40">عرض المزيد</ButtonLink></div>
    </section>
  );
}
