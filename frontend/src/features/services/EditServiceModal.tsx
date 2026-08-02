// File: frontend/src/features/services/EditServiceModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCurrencies } from "@/features/currencies/useCurrencies";
import { useUpdateService } from "@/features/services/useUpdateService";
import { inputBaseClass } from "@/lib/designTokens";
import type { ServiceOut } from "@/types/service";

const FLIGHT_BOOKING_CATEGORIES = new Set(["flight", "ship_ticket"]);

interface EditServiceModalProps {
  service: ServiceOut;
  onClose: () => void;
  onUpdated: (service: ServiceOut) => void;
}

/**
 * نموذج تعديل عنوان/وصف/سعر/حالة تفعيل خدمة قائمة (موظف أو مدير). حقل
 * السعر موحَّد: مبلغ واحد + عملة (افتراضياً دولار)؛ اختيار أي عملة غير
 * الدولار يثبّت السعر بها تماماً بلا أي تحويل لاحق.
 */
export function EditServiceModal({ service, onClose, onUpdated }: EditServiceModalProps) {
  const { updateService, isSubmitting, error } = useUpdateService();
  const { currencies } = useCurrencies();
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description ?? "");
  const [isActive, setIsActive] = useState(service.is_active);
  const [priceCurrencyCode, setPriceCurrencyCode] = useState(service.pinned_currency_code ?? "USD");
  const [priceAmount, setPriceAmount] = useState(service.pinned_price_amount ?? service.base_price_usd);

  const canPin = !FLIGHT_BOOKING_CATEGORIES.has(service.category);
  const isPinned = canPin && priceCurrencyCode !== "USD";
  const canSubmit = priceCurrencyCode.trim().length > 0 && Number(priceAmount) > 0;

  const handleSubmit = async () => {
    let basePriceUsdValue = priceAmount;
    if (isPinned) {
      const currency = currencies.find((c) => c.code === priceCurrencyCode);
      const rate = currency ? Number(currency.rate_to_usd) : 1;
      basePriceUsdValue = rate > 0 ? (Number(priceAmount) / rate).toFixed(2) : priceAmount;
    }

    const updated = await updateService(service.id, {
      title,
      description: description || null,
      base_price_usd: basePriceUsdValue,
      is_active: isActive,
      pinned_currency_code: isPinned ? priceCurrencyCode : null,
      pinned_price_amount: isPinned ? priceAmount : null,
    });
    if (updated) onUpdated(updated);
  };

  return (
    <Modal title={`تعديل: ${service.title}`} onClose={onClose}>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان الخدمة"
          className={`w-full ${inputBaseClass}`}
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="وصف اختياري"
          rows={2}
          className={`w-full ${inputBaseClass}`}
        />

        {canPin ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">السعر</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={priceAmount}
                onChange={(event) => setPriceAmount(event.target.value)}
                type="number"
                step="0.01"
                placeholder="السعر"
                className={`w-full ${inputBaseClass}`}
              />
              <select
                value={priceCurrencyCode}
                onChange={(event) => setPriceCurrencyCode(event.target.value)}
                className={`w-full ${inputBaseClass}`}
              >
                <option value="USD">دولار أمريكي (USD)</option>
                {currencies
                  .filter((currency) => currency.code !== "USD")
                  .map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
              </select>
            </div>
            {isPinned && (
              <p className="mt-1 text-xs text-gold-700">
                السعر مثبَّت بهذه العملة تماماً؛ لن يتغيّر مهما بدّل الزائر عملة العرض.
              </p>
            )}
          </div>
        ) : (
          <input
            value={priceAmount}
            onChange={(event) => setPriceAmount(event.target.value)}
            type="number"
            step="0.01"
            placeholder="السعر الأساسي (دولار)"
            className={`w-full ${inputBaseClass}`}
          />
        )}

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
          />
          الخدمة مفعَّلة (تظهر للعملاء)
        </label>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !title || !canSubmit}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </Modal>
  );
}
