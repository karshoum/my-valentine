// File: frontend/src/features/orders/NewOrderModal.tsx

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput";
import { useCurrencies } from "@/features/currencies/useCurrencies";
import { FlightSearchSection } from "@/features/flights/FlightSearchSection";
import { SelectedFlightCard } from "@/features/flights/SelectedFlightCard";
import { useCreateOrder } from "@/features/orders/useCreateOrder";
import { useServices } from "@/features/services/useServices";
import { inputBaseClass } from "@/lib/designTokens";
import type { ServiceCategory } from "@/types/enums";
import type { FlightOfferOut } from "@/types/flightBooking";
import type { OrderPassengerIn, OrderOut } from "@/types/order";

interface NewOrderModalProps {
  onClose: () => void;
  onCreated: (order: OrderOut) => void;
  /** يُملأ تلقائياً عند الوصول من رابط "احجز الآن" العام — يختار أول خدمة من هذا التصنيف إذا لم يُحدَّد initialServiceId. */
  initialCategory?: ServiceCategory;
  /** معرّف الخدمة الدقيق (لخدمات الفيزا/الإقامة/إلخ حيث توجد عدة خدمات بنفس التصنيف) — له الأولوية على initialCategory. */
  initialServiceId?: number;
  /** الرحلة التي بحث عنها الزائر فعلاً قبل تسجيل الدخول — تُملأ مباشرة بدل تكرار البحث من الصفر. */
  initialFlightOffer?: FlightOfferOut;
}

const FLIGHT_BOOKING_CATEGORIES = new Set(["flight", "ship_ticket"]);
const emptyPassenger: OrderPassengerIn = { full_name: "", passport_number: null };

/** نموذج إنشاء طلب جديد: اختيار خدمة، بحث/اختيار رحلة إن لزم، وإدخال بيانات المسافرين ورقم واتساب للتواصل. */
export function NewOrderModal({
  onClose,
  onCreated,
  initialCategory,
  initialServiceId,
  initialFlightOffer,
}: NewOrderModalProps) {
  const { services, isLoading: isLoadingServices } = useServices();
  const { currencies, isLoading: isLoadingCurrencies } = useCurrencies();
  const { createOrder, isSubmitting, error } = useCreateOrder();

  const [serviceId, setServiceId] = useState<number | "">("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [passengers, setPassengers] = useState<OrderPassengerIn[]>([{ ...emptyPassenger }]);
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [selectedFlightOffer, setSelectedFlightOffer] = useState<FlightOfferOut | null>(initialFlightOffer ?? null);

  useEffect(() => {
    if (serviceId !== "" || services.length === 0) return;
    if (initialServiceId) {
      if (services.some((service) => service.id === initialServiceId)) setServiceId(initialServiceId);
      return;
    }
    if (!initialCategory) return;
    const matchingService = services.find((service) => service.category === initialCategory);
    if (matchingService) setServiceId(matchingService.id);
  }, [initialCategory, initialServiceId, services, serviceId]);

  const selectedService = services.find((service) => service.id === serviceId);
  const requiresFlightBooking = Boolean(selectedService && FLIGHT_BOOKING_CATEGORIES.has(selectedService.category));

  const priceUsd = requiresFlightBooking
    ? (selectedFlightOffer ? Number(selectedFlightOffer.total_price_usd) : null)
    : (selectedService ? Number(selectedService.effective_price_usd) : null);
  const selectedCurrency = currencies.find((currency) => currency.code === currencyCode);
  const convertedTotal =
    priceUsd !== null && selectedCurrency ? (priceUsd * Number(selectedCurrency.rate_to_usd)).toFixed(2) : null;

  const updatePassenger = (index: number, field: keyof OrderPassengerIn, value: string) => {
    setPassengers((current) =>
      current.map((passenger, i) => (i === index ? { ...passenger, [field]: value || null } : passenger)),
    );
  };

  const addPassenger = () => setPassengers((current) => [...current, { ...emptyPassenger }]);
  const removePassenger = (index: number) =>
    setPassengers((current) => current.filter((_, i) => i !== index));

  const canSubmit =
    serviceId !== "" &&
    currencyCode &&
    contactWhatsapp.trim().length >= 8 &&
    passengers.every((passenger) => passenger.full_name.trim().length >= 2) &&
    (!requiresFlightBooking || selectedFlightOffer !== null);

  const handleSubmit = async () => {
    if (serviceId === "") return;
    const order = await createOrder({
      service_id: serviceId,
      currency_code: currencyCode,
      contact_whatsapp: contactWhatsapp.trim(),
      passengers: passengers.map((passenger) => ({
        full_name: passenger.full_name.trim(),
        passport_number: passenger.passport_number?.trim() || null,
      })),
      flight_booking: selectedFlightOffer
        ? {
            origin: selectedFlightOffer.origin,
            destination: selectedFlightOffer.destination,
            departure_date: selectedFlightOffer.departure_at.slice(0, 10),
            return_date: null,
            airline_name: selectedFlightOffer.airline_name,
            base_fare_usd: selectedFlightOffer.base_fare_usd,
          }
        : undefined,
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
            onChange={(event) => {
              setServiceId(event.target.value ? Number(event.target.value) : "");
              setSelectedFlightOffer(null);
            }}
            disabled={isLoadingServices}
            className={`w-full ${inputBaseClass}`}
          >
            <option value="">اختر خدمة...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
                {!FLIGHT_BOOKING_CATEGORIES.has(service.category) ? ` — $${service.effective_price_usd}` : ""}
              </option>
            ))}
          </select>
          {selectedService?.has_active_discount && (
            <p className="mt-1 text-xs text-navy-600">
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

        {requiresFlightBooking &&
          (selectedFlightOffer ? (
            <SelectedFlightCard offer={selectedFlightOffer} onChangeFlight={() => setSelectedFlightOffer(null)} />
          ) : (
            <FlightSearchSection onOfferSelected={setSelectedFlightOffer} />
          ))}

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
          {convertedTotal && (
            <p className="mt-1.5 rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2 text-sm">
              <span className="text-slate-600">الإجمالي: </span>
              <span className="font-bold text-navy-700">
                {convertedTotal} {currencyCode}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">رقم واتساب للتواصل</label>
          <PhoneNumberInput value={contactWhatsapp} onChange={setContactWhatsapp} placeholder="5xxxxxxxx" />
          <p className="mt-1 text-xs text-slate-500">يستخدمه الموظف للتواصل معك مباشرة عند وجود مستجدات على طلبك.</p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">المسافرون</label>
            <button
              type="button"
              onClick={addPassenger}
              className="flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-700"
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

        <p className="rounded-xl border border-gold-200 bg-gold-50/60 p-3 text-xs text-gold-800">
          بعد إنشاء الطلب، ستنتقل مباشرة لصفحة تفاصيله لرفع إثبات الدفع (إشعار التحويل) والمستندات المطلوبة.
        </p>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الطلب"}
        </button>
      </div>
    </Modal>
  );
}
