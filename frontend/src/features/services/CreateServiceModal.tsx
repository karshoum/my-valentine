// File: frontend/src/features/services/CreateServiceModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCurrencies } from "@/features/currencies/useCurrencies";
import { useCreateService } from "@/features/services/useCreateService";
import { inputBaseClass } from "@/lib/designTokens";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceCategory } from "@/types/enums";
import type { ServiceOut } from "@/types/service";

interface CreateServiceModalProps {
  onClose: () => void;
  onCreated: (service: ServiceOut) => void;
}

const VISA_OR_RESIDENCY: ServiceCategory[] = ["visa", "residency"];
const FLIGHT_BOOKING_CATEGORIES: ServiceCategory[] = ["flight", "ship_ticket"];

/** نموذج إضافة خدمة جديدة إلى الكتالوج، مع حقلي الدولة والنوع لخدمات الفيزا/الإقامة، وخيار تثبيت السعر بعملة محدَّدة (موظف أو مدير). */
export function CreateServiceModal({ onClose, onCreated }: CreateServiceModalProps) {
  const { createService, isSubmitting, error } = useCreateService();
  const { currencies } = useCurrencies();
  const [category, setCategory] = useState<ServiceCategory>("flight");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [pinnedCurrencyCode, setPinnedCurrencyCode] = useState("");
  const [pinnedPriceAmount, setPinnedPriceAmount] = useState("");

  const needsVisaDetail = VISA_OR_RESIDENCY.includes(category);
  const canPin = !FLIGHT_BOOKING_CATEGORIES.includes(category);
  const canSubmit = isPinned ? pinnedCurrencyCode.trim().length > 0 && Number(pinnedPriceAmount) > 0 : true;

  const handleSubmit = async () => {
    const service = await createService({
      category,
      title,
      description: description || null,
      base_price_usd: basePrice,
      visa_residency_detail:
        needsVisaDetail && country
          ? {
              country,
              type: visaType || "غير محدد",
              requirements: null,
              processing_time: null,
              is_dynamic_price: false,
            }
          : null,
      pinned_currency_code: canPin && isPinned ? pinnedCurrencyCode : null,
      pinned_price_amount: canPin && isPinned ? pinnedPriceAmount : null,
    });
    if (service) onCreated(service);
  };

  return (
    <Modal title="إضافة خدمة جديدة" onClose={onClose}>
      <div className="space-y-3">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ServiceCategory)}
          className={`w-full ${inputBaseClass}`}
        >
          {Object.entries(serviceCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

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

        {needsVisaDetail && (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="الدولة"
              className={`w-full ${inputBaseClass}`}
            />
            <input
              value={visaType}
              onChange={(event) => setVisaType(event.target.value)}
              placeholder="النوع (مثال: سياحية، عمل)"
              className={`w-full ${inputBaseClass}`}
            />
          </div>
        )}

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
          disabled={isSubmitting || !title || !basePrice || !canSubmit}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة الخدمة"}
        </button>
      </div>
    </Modal>
  );
}
