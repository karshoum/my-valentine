// File: frontend/src/features/agents/AgentCustomRateForm.tsx

import { useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { useSetCustomRate } from "@/features/agents/useSetCustomRate";
import { useServices } from "@/features/services/useServices";

/** نموذج تحديد سعر خاص لخدمة معينة لوكيل محدد (admin فقط). */
export function AgentCustomRateForm({ agentId }: { agentId: number }) {
  const { services, isLoading: isLoadingServices } = useServices();
  const { setCustomRate, isSubmitting, error, lastSavedRate } = useSetCustomRate(agentId);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    if (!serviceId || !price) return;
    await setCustomRate({ service_id: Number(serviceId), custom_price_usd: price });
  };

  if (isLoadingServices) {
    return <p className="text-sm text-slate-400">جارٍ تحميل الخدمات...</p>;
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-700">تحديد سعر خاص لخدمة</p>

      <select
        value={serviceId}
        onChange={(event) => setServiceId(event.target.value ? Number(event.target.value) : "")}
        className={`w-full ${inputBaseClass}`}
      >
        <option value="">اختر خدمة...</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.title} (${service.base_price_usd})
          </option>
        ))}
      </select>

      <input
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        type="number"
        placeholder="السعر الخاص بالدولار"
        className={`w-full ${inputBaseClass}`}
      />

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {lastSavedRate && (
        <p className="text-xs text-emerald-600">تم حفظ السعر الخاص: ${lastSavedRate.custom_price_usd}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !serviceId || !price}
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ السعر الخاص"}
      </button>
    </div>
  );
}
