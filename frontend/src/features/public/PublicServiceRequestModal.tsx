// File: frontend/src/features/public/PublicServiceRequestModal.tsx

import { FileText, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useCurrency } from "@/features/public/useCurrency";
import { glassPanelClass } from "@/lib/designTokens";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceOut } from "@/types/service";

interface Props {
  service: ServiceOut;
  onClose: () => void;
}

/**
 * نافذة تفاصيل الخدمة: تعرض المتطلبات والسعر وتوجّه الزائر لإنشاء
 * حساب لإكمال الطلب ورفع المستندات.
 */
export function PublicServiceRequestModal({ service, onClose }: Props) {
  const hasRealPrice = Number(service.effective_price_usd) > 0;
  const { formatUsd } = useCurrency();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`${glassPanelClass} w-full max-w-lg border-navy-100 bg-white/90 p-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
              {serviceCategoryLabels[service.category]}
            </span>
            {hasRealPrice ? (
              <span className="text-sm font-bold text-navy-700">
                {service.has_active_discount && (
                  <span className="ms-2 text-xs font-normal text-slate-400 line-through">
                    {formatUsd(service.base_price_usd)}
                  </span>
                )}
                {formatUsd(service.effective_price_usd)}
              </span>
            ) : (
              <span className="text-sm text-slate-400">السعر قريباً</span>
            )}
          </div>

          {service.description && <p className="text-sm text-slate-600">{service.description}</p>}

          {service.requirements.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FileText size={14} className="text-navy-500" />
                المستندات المطلوبة لهذه الخدمة
              </p>
              <ul className="space-y-1.5">
                {service.requirements
                  .slice()
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((req) => (
                    <li key={req.id} className="flex items-start gap-2 text-sm text-slate-600">
                      <Upload size={13} className="mt-0.5 shrink-0 text-navy-400" />
                      {req.requirement_text}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-3">
            <p className="text-sm text-gold-800">
              لإكمال طلبك ورفع المستندات المطلوبة، يرجى إنشاء حساب أو تسجيل الدخول أولاً.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            إغلاق
          </button>
          <Link
            to="/register"
            className="rounded-xl bg-navy-600 px-5 py-2 text-sm font-semibold text-white
              shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500"
          >
            سجّل وقدّم طلبك
          </Link>
        </div>
      </div>
    </div>
  );
}
