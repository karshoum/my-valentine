// File: frontend/src/features/orders/NewOrderModal.tsx

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCurrencies } from "@/features/currencies/useCurrencies";
import { useCreateOrder } from "@/features/orders/useCreateOrder";
import { useServices } from "@/features/services/useServices";
import { inputBaseClass } from "@/lib/designTokens";
import type { OrderPassengerIn, OrderOut } from "@/types/order";

interface NewOrderModalProps {
  onClose: () => void;
  onCreated: (order: OrderOut) => void;
}

const emptyPassenger: OrderPassengerIn = { full_name: "", passport_number: null };

/** نموذج إنشاء طلب جديد: اختيار خدمة وعملة السداد، وإدخال بيانات مسافر واحد أو أكثر. */
export function NewOrderModal({ onClose, onCreated }: NewOrderModalProps) {
  const { services, isLoading: isLoadingServices } = useServices();
  const { currencies, isLoading: isLoadingCurrencies } = useCurrencies();
  const { createOrder, isSubmitting, error } = useCreateOrder();

  const [serviceId, setServiceId] = useState<number | "">("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [passengers, setPassengers] = useState<OrderPassengerIn[]>([{ ...emptyPassenger }]);

  const selectedService = services.find((service) => service.id === serviceId);

  const updatePassenger = (index: number, field: keyof OrderPassengerIn, value: string) => {
    setPassengers((current) =>
      current.map((passenger, i) => (i === index ? { ...passenger, [field]: value || null } : passenger)),
    );
  };

  const addPassenger = () => setPassengers((current) => [...current, { ...emptyPassenger }]);
  const removePassenger = (index: number) =>
    setPassengers((current) => current.filter((_, i) => i !== index));

  const canSubmit =
    serviceId !== "" && currencyCode && passengers.every((passenger) => passenger.full_name.trim().length >= 2);

  const handleSubmit = async () => {
    if (serviceId === "") return;
    const order = await createOrder({
      service_id: serviceId,
      currency_code: currencyCode,
      passengers: passengers.map((passenger) => ({
        full_name: passenger.full_name.trim(),
        passport_number: passenger.passport_number?.trim() || null,
      })),
    });
    if (order) onCreated(order);
  };

  return (
    <Modal title="طلب جديد" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">الخدمة</label>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value ? Number(event.target.value) : "")}
            disabled={isLoadingServices}
            className={`w-full ${inputBaseClass}`}
          >
            <option value="">اختر خدمة...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} — ${service.effective_price_usd}
              </option>
            ))}
          </select>
          {selectedService?.has_active_discount && (
            <p className="mt-1 text-xs text-emerald-600">
              يشمل خصماً %{selectedService.discount_percentage} (السعر الأساسي ${selectedService.base_price_usd})
            </p>
          )}
        </div>

        {selectedService && selectedService.requirements.length > 0 && (
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 p-3">
            <p className="mb-1.5 text-sm font-medium text-sky-800">المستندات المطلوبة لهذه الخدمة</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-sky-700">
              {selectedService.requirements.map((requirement) => (
                <li key={requirement.id}>{requirement.requirement_text}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">عملة السداد</label>
          <select
            value={currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value)}
            disabled={isLoadingCurrencies}
            className={`w-full ${inputBaseClass}`}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">المسافرون</label>
            <button
              type="button"
              onClick={addPassenger}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus size={14} />
              إضافة مسافر
            </button>
          </div>

          <div className="space-y-2">
            {passengers.map((passenger, index) => (
              <div key={index} className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="flex-1 space-y-2">
                  <input
                    value={passenger.full_name}
                    onChange={(event) => updatePassenger(index, "full_name", event.target.value)}
                    placeholder="الاسم الكامل"
                    className={`w-full ${inputBaseClass}`}
                  />
                  <input
                    value={passenger.passport_number ?? ""}
                    onChange={(event) => updatePassenger(index, "passport_number", event.target.value)}
                    placeholder="رقم جواز السفر (اختياري)"
                    className={`w-full ${inputBaseClass}`}
                  />
                </div>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الطلب"}
        </button>
      </div>
    </Modal>
  );
}
