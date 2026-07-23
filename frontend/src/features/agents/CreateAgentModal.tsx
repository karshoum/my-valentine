// File: frontend/src/features/agents/CreateAgentModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { inputBaseClass } from "@/lib/designTokens";
import { paymentModeLabels } from "@/lib/paymentModeLabels";
import { useCreateAgent } from "@/features/agents/useCreateAgent";
import type { AgentOut } from "@/types/agent";
import type { PaymentMode } from "@/types/enums";

interface CreateAgentModalProps {
  onClose: () => void;
  onCreated: (agent: AgentOut) => void;
}

/** نموذج إنشاء حساب وكيل B2B جديد (admin فقط). */
export function CreateAgentModal({ onClose, onCreated }: CreateAgentModalProps) {
  const { createAgent, isSubmitting, error } = useCreateAgent();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("pay_per_order");
  const [creditLimit, setCreditLimit] = useState("0");
  const [discountRate, setDiscountRate] = useState("0");

  const handleSubmit = async () => {
    const agent = await createAgent({
      full_name: fullName,
      email: email || null,
      phone,
      password,
      agency_name: agencyName,
      payment_mode: paymentMode,
      credit_limit: creditLimit,
      discount_rate: discountRate,
    });
    if (agent) onCreated(agent);
  };

  return (
    <Modal title="إضافة وكيل B2B جديد" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="الاسم الكامل"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={agencyName}
          onChange={(event) => setAgencyName(event.target.value)}
          placeholder="اسم الوكالة"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="رقم الهاتف"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="البريد الإلكتروني (اختياري)"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="كلمة المرور"
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
          disabled={isSubmitting}
          className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء حساب الوكيل"}
        </button>
      </div>
    </Modal>
  );
}
