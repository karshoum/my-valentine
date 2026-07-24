// File: frontend/src/features/flights/BookingFeeSettingsPage.tsx

import { useEffect, useState } from "react";

import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useFlightBookingFeeSetting } from "@/features/flights/useFlightBookingFeeSetting";
import { inputBaseClass } from "@/lib/designTokens";
import type { FlightBookingFeeType } from "@/types/enums";

/**
 * شاشة إدارة رسوم حجز الطيران (admin فقط): يختار المدير بين رسم ثابت
 * بالدولار يُضاف فوق سعر التذكرة الحقيقي، أو نسبة مئوية من السعر —
 * ويعدّلها في أي وقت حسب كل حالة.
 */
export function BookingFeeSettingsPage() {
  const { setting, isLoading, updateSetting, isSubmitting, error } = useFlightBookingFeeSetting();
  const [feeType, setFeeType] = useState<FlightBookingFeeType>("flat");
  const [feeValue, setFeeValue] = useState("0");
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (setting) {
      setFeeType(setting.fee_type);
      setFeeValue(setting.fee_value);
    }
  }, [setting]);

  const handleSave = async () => {
    setHasSaved(false);
    const succeeded = await updateSetting({ fee_type: feeType, fee_value: feeValue });
    if (succeeded) setHasSaved(true);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">رسوم حجز الطيران</h1>
        <p className="text-sm text-slate-500">
          تُضاف هذه الرسوم تلقائياً فوق سعر التذكرة الحقيقي عند بحث/حجز أي رحلة طيران أو باخرة.
        </p>
      </div>

      <div className="max-w-md space-y-3 rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">طريقة احتساب الرسم</label>
          <select
            value={feeType}
            onChange={(event) => setFeeType(event.target.value as FlightBookingFeeType)}
            className={`w-full ${inputBaseClass}`}
          >
            <option value="flat">مبلغ ثابت بالدولار فوق كل تذكرة</option>
            <option value="percentage">نسبة مئوية من سعر التذكرة</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {feeType === "flat" ? "قيمة الرسم (دولار)" : "النسبة المئوية (%)"}
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={feeValue}
            onChange={(event) => setFeeValue(event.target.value)}
            className={`w-full ${inputBaseClass}`}
          />
        </div>

        {feeType === "flat" && Number(feeValue) === 0 && (
          <p className="text-xs text-slate-500">قيمة 0 تعني الحجز بنفس سعر التذكرة الحقيقي بلا أي رسوم إضافية.</p>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}
        {hasSaved && <p className="text-xs text-navy-600">تم حفظ الإعداد بنجاح.</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}
