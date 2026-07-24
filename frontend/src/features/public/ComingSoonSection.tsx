// File: frontend/src/features/public/ComingSoonSection.tsx

import { Megaphone, Truck } from "lucide-react";
import { useState } from "react";

import { LeadInterestModal } from "@/features/public/LeadInterestModal";
import type { LeadServiceType } from "@/types/enums";

const FUTURE_SERVICES: { serviceType: LeadServiceType; title: string; description: string; icon: typeof Truck }[] = [
  {
    serviceType: "logistics",
    title: "الخدمات اللوجستية",
    description: "شحن وتخليص جمركي ونقل بضائع محلياً ودولياً — قريباً ضمن خدمات الوكالة.",
    icon: Truck,
  },
  {
    serviceType: "media_ads",
    title: "الدعاية والإعلان",
    description: "حملات إعلانية وتسويقية لأعمالك عبر منصات التواصل الاجتماعي — قريباً ضمن خدمات الوكالة.",
    icon: Megaphone,
  },
];

/** قسم "قريباً": يعرض خدمات مستقبلية لم تُطلق بعد، ويتيح للزائر تسجيل اهتمامه بها (Lead) قبل الإطلاق. */
export function ComingSoonSection() {
  const [selectedService, setSelectedService] = useState<LeadServiceType | null>(null);
  const selected = FUTURE_SERVICES.find((service) => service.serviceType === selectedService);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FUTURE_SERVICES.map((service) => (
        <div
          key={service.serviceType}
          className="flex flex-col gap-3 rounded-2xl border border-gold-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <service.icon size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{service.title}</p>
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700">قريباً</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">{service.description}</p>
          <button
            type="button"
            onClick={() => setSelectedService(service.serviceType)}
            className="mt-auto w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white
              transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
          >
            سجّل اهتمامك
          </button>
        </div>
      ))}

      {selected && (
        <LeadInterestModal
          serviceType={selected.serviceType}
          title={selected.title}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
