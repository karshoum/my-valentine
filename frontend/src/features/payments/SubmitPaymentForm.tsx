// File: frontend/src/features/payments/SubmitPaymentForm.tsx

import { Copy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { usePaymentSettings } from "@/features/payments/usePaymentSettings";
import { useSubmitPayment } from "@/features/payments/useSubmitPayment";
import { inputBaseClass } from "@/lib/designTokens";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { PaymentMethod } from "@/types/enums";
import type { OrderOut } from "@/types/order";

interface SubmitPaymentFormProps {
  order: OrderOut;
  onSubmitted: () => void;
}

/**
 * نموذج رفع إثبات دفع لطلب بحالة pending: بنكك (يعرض رقم الحساب
 * المصرفي الذي ضبطه المدير) أو فيزا كارت (زر ينقل العميل مباشرة لمحادثة
 * واتساب لتأكيد العملية)، مع رفع صورة إشعار التحويل لطريقة بنكك.
 */
export function SubmitPaymentForm({ order, onSubmitted }: SubmitPaymentFormProps) {
  const { submitPayment, isSubmitting, error } = useSubmitPayment();
  const { settings } = usePaymentSettings();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bankak");
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [didCopy, setDidCopy] = useState(false);

  const availableMethods = (["bankak", "visa"] as PaymentMethod[]).filter((method) =>
    method === "bankak" ? (settings?.bankak_is_enabled ?? true) : (settings?.visa_is_enabled ?? true),
  );

  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0]);
    }
  }, [settings]);

  const canSubmit = paymentMethod !== "bankak" || receiptFile !== null;

  const handleCopyAccountNumber = () => {
    if (!settings?.bankak_account_number) return;
    navigator.clipboard.writeText(settings.bankak_account_number).then(() => {
      setDidCopy(true);
      setTimeout(() => setDidCopy(false), 2000);
    });
  };

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
        {availableMethods.map((method) => (
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

      {paymentMethod === "bankak" && settings?.bankak_account_number && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-navy-100 bg-navy-50/60 p-3">
          <div>
            <p className="text-xs text-slate-500">حوّل المبلغ لحساب بنكك التالي:</p>
            <p className="text-sm font-bold text-navy-800">{settings.bankak_account_number}</p>
            {settings.bankak_account_name && (
              <p className="text-xs text-slate-500">باسم: {settings.bankak_account_name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopyAccountNumber}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium
              text-navy-700 shadow-sm transition-colors hover:bg-navy-100"
          >
            <Copy size={13} />
            {didCopy ? "تم النسخ" : "نسخ"}
          </button>
        </div>
      )}

      {paymentMethod === "visa" && settings?.visa_whatsapp_number && (
        <a
          href={buildWhatsAppLink(settings.visa_whatsapp_number)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm
            font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-green-700
            active:scale-[0.98]"
        >
          <MessageCircle size={16} />
          تأكيد الدفع عبر واتساب
        </a>
      )}

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
