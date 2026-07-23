// File: frontend/src/features/currencies/UpdateRateModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { inputBaseClass } from "@/lib/designTokens";
import { useUpdateCurrencyRate } from "@/features/currencies/useUpdateCurrencyRate";
import type { CurrencyOut } from "@/types/currency";

interface UpdateRateModalProps {
  currency: CurrencyOut;
  onClose: () => void;
  onUpdated: (updatedCurrency: CurrencyOut) => void;
}

/** نموذج التحديث اليدوي الحصري لسعر صرف عملة مقابل الدولار (admin فقط). */
export function UpdateRateModal({ currency, onClose, onUpdated }: UpdateRateModalProps) {
  const { updateRate, isSubmitting, error } = useUpdateCurrencyRate();
  const [rate, setRate] = useState(currency.rate_to_usd);

  const handleSubmit = async () => {
    const updatedCurrency = await updateRate(currency.code, rate);
    if (updatedCurrency) onUpdated(updatedCurrency);
  };

  return (
    <Modal title={`تحديث سعر ${currency.name} (${currency.code})`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          السعر الحالي: {currency.rate_to_usd} {currency.code} = 1 USD
        </p>

        <input
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          type="number"
          step="0.0001"
          placeholder="السعر الجديد مقابل الدولار"
          className={`w-full ${inputBaseClass}`}
        />

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ التحديث..." : "تأكيد السعر الجديد"}
        </button>
      </div>
    </Modal>
  );
}
