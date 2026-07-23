// File: frontend/src/features/payments/SubmitPaymentForm.tsx

import { useState } from "react";

import { useSubmitPayment } from "@/features/payments/useSubmitPayment";
import { inputBaseClass } from "@/lib/designTokens";
import type { PaymentMethod } from "@/types/enums";
import type { OrderOut } from "@/types/order";

interface SubmitPaymentFormProps {
  order: OrderOut;
  onSubmitted: () => void;
}

/** نموذج رفع إثبات دفع (بنكك أو فيزا) لطلب بحالة pending، بما يشمل صورة إشعار التحويل لطريقة بنكك. */
export function SubmitPaymentForm({ order, onSubmitted }: SubmitPaymentFormProps) {
  const { submitPayment, isSubmitting, error } = useSubmitPayment();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bankak");
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const canSubmit = paymentMethod !== "bankak" || receiptFile !== null;

  const handleSubmit = async () => {
    const payment = await submitPayment(order.id, {
      paymentMethod,
      amount: order.total_amount,
      transactionRef: transactionRef.trim() || null,
      receiptFile,
    });
    if (payment) onSubmitted();
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-700">رفع إثبات الدفع</p>
      <p className="text-xs text-slate-500">
        المبلغ المطلوب: {order.total_amount} {order.currency_code}
      </p>

      <div className="flex gap-2">
        {(["bankak", "visa"] as PaymentMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
              paymentMethod === method
                ? "bg-navy-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {method === "bankak" ? "تحويل بنكك" : "فيزا"}
          </button>
        ))}
      </div>

      <input
        value={transactionRef}
        onChange={(event) => setTransactionRef(event.target.value)}
        placeholder="مرجع التحويل / رقم العملية (اختياري)"
        className={`w-full ${inputBaseClass}`}
      />

      <div>
        <label className="mb-1 block text-xs text-slate-500">
          {paymentMethod === "bankak" ? "صورة إشعار التحويل (إلزامي)" : "صورة إثبات الدفع (اختياري)"}
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
          className="w-full text-sm text-slate-600 file:me-3 file:rounded-lg file:border-0 file:bg-navy-50
            file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy-700"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الرفع..." : "رفع إثبات الدفع"}
      </button>
    </div>
  );
}
