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

/** نموذج تعديل عنوان/وصف/سعر/حالة تفعيل خدمة قائمة (موظف أو مدير)، مع خيار تثبيت السعر بعملة محدَّدة. */
export function EditServiceModal({ service, onClose, onUpdated }: EditServiceModalProps) {
  const { updateService, isSubmitting, error } = useUpdateService();
  const { currencies } = useCurrencies();
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description ?? "");
  const [basePrice, setBasePrice] = useState(service.base_price_usd);
  const [isActive, setIsActive] = useState(service.is_active);
  const [isPinned, setIsPinned] = useState(Boolean(service.pinned_currency_code));
  const [pinnedCurrencyCode, setPinnedCurrencyCode] = useState(service.pinned_currency_code ?? "");
  const [pinnedPriceAmount, setPinnedPriceAmount] = useState(service.pinned_price_amount ?? "");

  const canPin = !FLIGHT_BOOKING_CATEGORIES.has(service.category);
  const canSubmit = isPinned ? pinnedCurrencyCode.trim().length > 0 && Number(pinnedPriceAmount) > 0 : true;

  const handleSubmit = async () => {
    const updated = await updateService(service.id, {
      title,
      description: description || null,
      base_price_usd: basePrice,
      is_active: isActive,
      pinned_currency_code: isPinned ? pinnedCurrencyCode : null,
      pinned_price_amount: isPinned ? pinnedPriceAmount : null,
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

        <input
          value={basePrice}
          onChange={(event) => setBasePrice(event.target.value)}
          type="number"
          step="0.01"
          placeholder="السعر الأساسي (دولار)"
          className={`w-full ${inputBaseClass}`}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
          />
          الخدمة مفعَّلة (تظهر للعملاء)
        </label>

        {canPin && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
              />
              تثبيت السعر بعملة محدَّدة (لا يتغيّر مهما بدّل الزائر عملة العرض)
            </label>

            {isPinned && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={pinnedCurrencyCode}
                  onChange={(event) => setPinnedCurrencyCode(event.target.value)}
                  className={`w-full ${inputBaseClass}`}
                >
                  <option value="">— اختر العملة —</option>
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                <input
                  value={pinnedPriceAmount}
                  onChange={(event) => setPinnedPriceAmount(event.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="السعر المثبَّت"
                  className={`w-full ${inputBaseClass}`}
                />
              </div>
            )}
          </div>
        )}

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
