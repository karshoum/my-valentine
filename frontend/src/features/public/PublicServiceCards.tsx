// File: frontend/src/features/public/PublicServiceCards.tsx

import { FileText } from "lucide-react";
import { useState } from "react";

import { useCurrency } from "@/features/public/useCurrency";
import { cardHoverClass, glassPanelClass } from "@/lib/designTokens";
import { formatServiceBasePrice, formatServicePrice } from "@/lib/formatServicePrice";
import { serviceCategoryIcons } from "@/lib/serviceCategoryIcons";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceOut } from "@/types/service";

import { PublicServiceRequestModal } from "./PublicServiceRequestModal";

interface PublicServiceCardsProps {
  services: ServiceOut[];
}

/** شبكة بطاقات الخدمات العامة: سعر، متطلبات، وزر "قدّم طلبك". */
export function PublicServiceCards({ services }: PublicServiceCardsProps) {
  const [selectedService, setSelectedService] = useState<ServiceOut | null>(null);
  const { formatUsd } = useCurrency();

  if (services.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">لا توجد خدمات في هذا التصنيف حالياً</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const hasRealPrice = Number(service.effective_price_usd) > 0;
          const CategoryIcon = serviceCategoryIcons[service.category];
          return (
            <div key={service.id} className={`${glassPanelClass} ${cardHoverClass} flex flex-col p-5`}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <CategoryIcon size={15} />
                </span>
                <span className="w-fit rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
                  {serviceCategoryLabels[service.category]}
                </span>
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">{service.title}</h3>
              {service.description && <p className="mb-3 text-sm text-slate-600">{service.description}</p>}

              {service.requirements.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    <FileText size={12} className="ms-1 inline" />
                    المستندات المطلوبة:
                  </p>
                  <ul className="space-y-0.5 text-xs text-slate-600">
                    {service.requirements
                      .slice()
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((req) => (
                        <li key={req.id} className="flex gap-1.5">
                          <span className="text-navy-400">•</span>
                          {req.requirement_text}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex items-center justify-between pt-2">
                {hasRealPrice ? (
                  <p className="text-sm font-semibold text-navy-700">
                    {service.has_active_discount && (
                      <span className="ms-2 text-xs font-normal text-slate-400 line-through">
                        {formatServiceBasePrice(service, formatUsd)}
                      </span>
                    )}
                    {formatServicePrice(service, formatUsd)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">السعر قريباً</p>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className="rounded-xl bg-navy-600 px-3.5 py-2 text-sm font-semibold text-white
                    shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 active:scale-[0.98]"
                >
                  قدّم طلبك
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedService && (
        <PublicServiceRequestModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  );
}
