// File: frontend/src/features/payments/PaymentSettingsPage.tsx

import { useEffect, useState } from "react";

import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { usePaymentSettings } from "@/features/payments/usePaymentSettings";
import { inputBaseClass } from "@/lib/designTokens";

/**
 * شاشة إدارة وسائل الدفع (admin فقط): رقم واسم حساب بنكك الذي يظهر
 * للعميل عند اختيار الدفع عبر بنكك، ورقم واتساب لتأكيد الدفع بالفيزا
 * مباشرة، مع مفتاح تفعيل/تعطيل مستقل لكل وسيلة.
 */
export function PaymentSettingsPage() {
  const { settings, isLoading, updateSettings, isSubmitting, error } = usePaymentSettings();
  const [bankakAccountNumber, setBankakAccountNumber] = useState("");
  const [bankakAccountName, setBankakAccountName] = useState("");
  const [bankakIsEnabled, setBankakIsEnabled] = useState(true);
  const [visaWhatsappNumber, setVisaWhatsappNumber] = useState("");
  const [visaIsEnabled, setVisaIsEnabled] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setBankakAccountNumber(settings.bankak_account_number ?? "");
    setBankakAccountName(settings.bankak_account_name ?? "");
    setBankakIsEnabled(settings.bankak_is_enabled);
    setVisaWhatsappNumber(settings.visa_whatsapp_number ?? "");
    setVisaIsEnabled(settings.visa_is_enabled);
  }, [settings]);

  const handleSave = async () => {
    setHasSaved(false);
    const succeeded = await updateSettings({
      bankak_account_number: bankakAccountNumber.trim() || null,
      bankak_account_name: bankakAccountName.trim() || null,
      bankak_is_enabled: bankakIsEnabled,
      visa_whatsapp_number: visaWhatsappNumber.trim() || null,
      visa_is_enabled: visaIsEnabled,
    });
    if (succeeded) setHasSaved(true);
  };

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل إعداد وسائل الدفع..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">وسائل الدفع</h1>
        <p className="text-sm text-slate-500">
          تُعرَض هذه البيانات مباشرة للعميل عند رفع إثبات الدفع لأي طلب.
        </p>
      </div>

      <div className="max-w-md space-y-4 rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={bankakIsEnabled}
              onChange={(event) => setBankakIsEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
            />
            تفعيل الدفع عبر بنكك
          </label>
          <input
            value={bankakAccountNumber}
            onChange={(event) => setBankakAccountNumber(event.target.value)}
            placeholder="رقم حساب بنكك"
            className={`w-full ${inputBaseClass}`}
          />
          <input
            value={bankakAccountName}
            onChange={(event) => setBankakAccountName(event.target.value)}
            placeholder="اسم صاحب الحساب (اختياري)"
            className={`w-full ${inputBaseClass}`}
          />
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={visaIsEnabled}
              onChange={(event) => setVisaIsEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
            />
            تفعيل الدفع عبر فيزا كارت
          </label>
          <input
            value={visaWhatsappNumber}
            onChange={(event) => setVisaWhatsappNumber(event.target.value)}
            placeholder="رقم واتساب لتأكيد الدفع (مثال: 249912345678)"
            className={`w-full ${inputBaseClass}`}
          />
          <p className="text-xs text-slate-500">
            عند اختيار العميل "فيزا كارت"، يُنقَل مباشرة لمحادثة واتساب مع هذا الرقم لتأكيد العملية.
          </p>
        </div>

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
