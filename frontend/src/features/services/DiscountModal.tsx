// File: frontend/src/features/services/DiscountModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useSetServiceDiscount } from "@/features/services/useSetServiceDiscount";
import { inputBaseClass } from "@/lib/designTokens";
import type { ServiceOut } from "@/types/service";

interface DiscountModalProps {
  service: ServiceOut;
  onClose: () => void;
  onUpdated: (service: ServiceOut) => void;
}

/** يحوّل قيمة حقل datetime-local المحلية إلى نص ISO كامل يفهمه الـ backend. */
function toIsoString(localDateTimeValue: string): string {
  return new Date(localDateTimeValue).toISOString();
}

/** نموذج تحديد أو إلغاء عرض خصم محدود المدة على خدمة (admin فقط). */
export function DiscountModal({ service, onClose, onUpdated }: DiscountModalProps) {
  const { setDiscount, isSubmitting, error } = useSetServiceDiscount();
  const [percentage, setPercentage] = useState(service.discount_percentage ?? "");
  const [validUntil, setValidUntil] = useState(
    service.discount_valid_until ? service.discount_valid_until.slice(0, 16) : "",
  );

  const handleActivate = async () => {
    const updated = await setDiscount(service.id, {
      discount_percentage: percentage,
      discount_valid_until: toIsoString(validUntil),
    });
    if (updated) onUpdated(updated);
  };

  const handleClear = async () => {
    const updated = await setDiscount(service.id, { discount_percentage: null, discount_valid_until: null });
    if (updated) onUpdated(updated);
  };

  return (
    <Modal title={`عرض خصم: ${service.title}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          السعر الأساسي الحالي: ${service.base_price_usd}
          {service.has_active_discount && <> — السعر الفعلي الآن: ${service.effective_price_usd}</>}
        </p>

        <input
          value={percentage}
          onChange={(event) => setPercentage(event.target.value)}
          type="number"
          min={0}
          max={100}
          step="1"
          placeholder="نسبة الخصم % (مثال: 20)"
          className={`w-full ${inputBaseClass}`}
        />

        <input
          value={validUntil}
          onChange={(event) => setValidUntil(event.target.value)}
          type="datetime-local"
          className={`w-full ${inputBaseClass}`}
        />

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleActivate}
          disabled={isSubmitting || !percentage || !validUntil}
          className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "تفعيل العرض"}
        </button>

        {service.discount_percentage && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600
              transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            إلغاء العرض الحالي
          </button>
        )}
      </div>
    </Modal>
  );
}
