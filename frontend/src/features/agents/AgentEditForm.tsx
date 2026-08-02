// File: frontend/src/features/agents/AgentEditForm.tsx

import { useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { paymentModeLabels } from "@/lib/paymentModeLabels";
import { useUpdateAgent } from "@/features/agents/useUpdateAgent";
import type { AgentOut } from "@/types/agent";
import type { PaymentMode } from "@/types/enums";

interface AgentEditFormProps {
  agent: AgentOut;
  onUpdated: (updatedAgent: AgentOut) => void;
}

/** نموذج تعديل وضع الدفع والحد الائتماني ونسبة الخصم لوكيل (admin فقط). */
export function AgentEditForm({ agent, onUpdated }: AgentEditFormProps) {
  const { updateAgent, isSubmitting, error } = useUpdateAgent();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(agent.payment_mode);
  const [creditLimit, setCreditLimit] = useState(agent.credit_limit);
  const [discountRate, setDiscountRate] = useState(agent.discount_rate);

  const handleSubmit = async () => {
    const updatedAgent = await updateAgent(agent.id, {
      payment_mode: paymentMode,
      credit_limit: creditLimit,
      discount_rate: discountRate,
    });
    if (updatedAgent) onUpdated(updatedAgent);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-700">تعديل شروط الوكيل</p>

      <select
        value={paymentMode}
        onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}
        className={`w-full ${inputBaseClass}`}
      >
        {Object.entries(paymentModeLabels).map(([mode, label]) => (
          <option key={mode} value={mode}>
            {label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          value={creditLimit}
          onChange={(event) => setCreditLimit(event.target.value)}
          type="number"
          placeholder="الحد الائتماني"
          className={inputBaseClass}
        />
        <input
          value={discountRate}
          onChange={(event) => setDiscountRate(event.target.value)}
          type="number"
          placeholder="نسبة الخصم %"
          className={inputBaseClass}
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
      </button>
    </div>
  );
}
