// File: frontend/src/features/refunds/RequestRefundForm.tsx

import { useState } from "react";

import { useCreateRefund } from "@/features/refunds/useCreateRefund";
import { inputBaseClass } from "@/lib/designTokens";
import type { OrderOut } from "@/types/order";

interface RequestRefundFormProps {
  order: OrderOut;
  onRequested: () => void;
}

/** نموذج تقديم طلب استرداد لطلب مؤهَّل (قيد المعالجة/في السيستم/مكتمل بلا طلب استرداد مفتوح). */
export function RequestRefundForm({ order, onRequested }: RequestRefundFormProps) {
  const { createRefund, isSubmitting, error } = useCreateRefund();
  const [amount, setAmount] = useState(order.total_amount);
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    const refund = await createRefund(order.id, {
      refund_amount: amount,
      currency_code: order.currency_code,
      reason: reason.trim() || null,
    });
    if (refund) onRequested();
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-700">طلب استرداد</p>

      <input
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        type="number"
        step="0.01"
        placeholder="المبلغ المطلوب استرداده"
        className={`w-full ${inputBaseClass}`}
      />

      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="سبب الاسترداد (اختياري)"
        rows={2}
        className={`w-full resize-none ${inputBaseClass}`}
      />

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !amount}
        className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الإرسال..." : "تقديم طلب استرداد"}
      </button>
    </div>
  );
}
