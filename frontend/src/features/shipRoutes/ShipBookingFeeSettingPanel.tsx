// File: frontend/src/features/shipRoutes/ShipBookingFeeSettingPanel.tsx

import { useEffect, useState } from "react";

import { useShipBookingFeeSetting } from "@/features/shipRoutes/useShipBookingFeeSetting";
import { glassPanelClass, inputBaseClass } from "@/lib/designTokens";
import type { FlightBookingFeeType } from "@/types/enums";

/**
 * لوحة إدارة رسم حجز تذاكر البواخر (admin فقط): يختار المدير بين رسم
 * ثابت بالدولار يُضاف فوق سعر خط الباخرة الحقيقي، أو نسبة مئوية منه.
 */
export function ShipBookingFeeSettingPanel() {
  const { setting, isLoading, updateSetting, isSubmitting, error } = useShipBookingFeeSetting();
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
    return <p className="text-sm text-slate-500">جارٍ تحميل رسم الحجز...</p>;
  }

  return (
    <div className={`${glassPanelClass} mb-5 space-y-3 p-4`}>
      <div>
        <h2 className="text-sm font-bold text-slate-900">رسم حجز تذاكر البواخر</h2>
        <p className="text-xs text-slate-500">يُضاف تلقائياً فوق سعر خط الباخرة الحقيقي (الذي يبقى كما هو دائماً).</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">طريقة الاحتساب</label>
          <select
            value={feeType}
            onChange={(event) => setFeeType(event.target.value as FlightBookingFeeType)}
            className={`w-full ${inputBaseClass}`}
          >
            <option value="flat">مبلغ ثابت بالدولار</option>
            <option value="percentage">نسبة مئوية من سعر الحجز</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
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
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hasSaved && <p className="text-xs text-navy-600">تم حفظ الإعداد بنجاح.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSubmitting}
        className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300
          hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
      </button>
    </div>
  );
}
