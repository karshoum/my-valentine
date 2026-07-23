// File: frontend/src/features/currencies/CreateCurrencyModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { inputBaseClass } from "@/lib/designTokens";
import { useCreateCurrency } from "@/features/currencies/useCreateCurrency";
import type { CurrencyOut } from "@/types/currency";

interface CreateCurrencyModalProps {
  onClose: () => void;
  onCreated: (currency: CurrencyOut) => void;
}

/** نموذج إضافة عملة جديدة بسعر ابتدائي (admin فقط). */
export function CreateCurrencyModal({ onClose, onCreated }: CreateCurrencyModalProps) {
  const { createCurrency, isSubmitting, error } = useCreateCurrency();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  const handleSubmit = async () => {
    const currency = await createCurrency({ code: code.toUpperCase(), name, rate_to_usd: rate });
    if (currency) onCreated(currency);
  };

  return (
    <Modal title="إضافة عملة جديدة" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="رمز العملة (مثال: SDG)"
          maxLength={5}
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="اسم العملة"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          type="number"
          step="0.0001"
          placeholder="السعر الابتدائي مقابل الدولار"
          className={`w-full ${inputBaseClass}`}
        />

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة العملة"}
        </button>
      </div>
    </Modal>
  );
}
