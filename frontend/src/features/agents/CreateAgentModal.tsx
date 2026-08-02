// File: frontend/src/features/agents/CreateAgentModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { usePromoteToAgent } from "@/features/agents/usePromoteToAgent";
import { CustomerPicker } from "@/features/users/CustomerPicker";
import { inputBaseClass } from "@/lib/designTokens";
import { paymentModeLabels } from "@/lib/paymentModeLabels";
import type { AgentOut } from "@/types/agent";
import type { PaymentMode } from "@/types/enums";
import type { UserOut } from "@/types/user";

interface CreateAgentModalProps {
  onClose: () => void;
  onCreated: (agent: AgentOut) => void;
}

/**
 * نموذج ترقية حساب عميل عادي مسجَّل مسبقاً إلى وكيل B2B (admin فقط) —
 * يختار المدير الحساب من قائمة العملاء الموجودين ثم يُدخِل بيانات
 * الوكالة فقط، بدل ملء كل بيانات الحساب من الصفر.
 */
export function CreateAgentModal({ onClose, onCreated }: CreateAgentModalProps) {
  const { promoteToAgent, isSubmitting, error } = usePromoteToAgent();
  const [selectedCustomer, setSelectedCustomer] = useState<UserOut | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("pay_per_order");
  const [creditLimit, setCreditLimit] = useState("0");
  const [discountRate, setDiscountRate] = useState("0");

  const canSubmit = Boolean(selectedCustomer) && agencyName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    const agent = await promoteToAgent({
      user_id: selectedCustomer.id,
      agency_name: agencyName.trim(),
      payment_mode: paymentMode,
      credit_limit: creditLimit,
      discount_rate: discountRate,
    });
    if (agent) onCreated(agent);
  };

  return (
    <Modal title="ترقية عميل إلى وكيل B2B" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          اختر حساب عميل مسجَّل بالفعل من القائمة أدناه، ثم أدخل بيانات الوكالة.
        </p>

        <CustomerPicker selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />

        {selectedCustomer && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-sm text-violet-800">
            الحساب المختار: <span className="font-semibold">{selectedCustomer.full_name}</span>
          </div>
        )}

        <input
          value={agencyName}
          onChange={(event) => setAgencyName(event.target.value)}
          placeholder="اسم الوكالة"
          className={`w-full ${inputBaseClass}`}
        />

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
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الترقية..." : "ترقية إلى وكيل"}
        </button>
      </div>
    </Modal>
  );
}
