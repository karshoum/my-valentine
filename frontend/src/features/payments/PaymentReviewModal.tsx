// File: frontend/src/features/payments/PaymentReviewModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useVerifyPayment } from "@/features/payments/useVerifyPayment";
import { buildFileUrl } from "@/lib/apiClient";
import { inputBaseClass } from "@/lib/designTokens";
import { paymentMethodLabels } from "@/lib/paymentMethodLabels";
import type { PaymentOut } from "@/types/payment";

interface PaymentReviewModalProps {
  payment: PaymentOut;
  onClose: () => void;
  onReviewed: () => void;
}

/** نافذة مراجعة يدوية لمحاولة دفع معلَّقة: عرض الإيصال (إن وُجد) وقرار اعتماد/رفض. */
export function PaymentReviewModal({ payment, onClose, onReviewed }: PaymentReviewModalProps) {
  const { verifyPayment, isSubmitting, error } = useVerifyPayment();
  const [notes, setNotes] = useState("");

  const handleDecision = async (approve: boolean) => {
    const result = await verifyPayment(payment.id, approve, notes.trim() || null);
    if (result) onReviewed();
  };

  return (
    <Modal title={`مراجعة دفع: ${payment.order_number}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-800">الطريقة:</span> {paymentMethodLabels[payment.payment_method]}
          </p>
          <p className="mt-1">
            <span className="font-medium text-slate-800">المبلغ:</span> {payment.amount} {payment.currency_code}
          </p>
          {payment.transaction_ref && (
            <p className="mt-1">
              <span className="font-medium text-slate-800">مرجع التحويل:</span> {payment.transaction_ref}
            </p>
          )}
        </div>

        {payment.receipt_signed_url ? (
          <a href={buildFileUrl(payment.receipt_signed_url)} target="_blank" rel="noreferrer">
            <img
              src={buildFileUrl(payment.receipt_signed_url)}
              alt="إشعار الدفع"
              className="max-h-72 w-full rounded-xl border border-slate-200/80 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <p className="mt-1 text-center text-xs text-navy-600">فتح إشعار الدفع في نافذة جديدة</p>
          </a>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            لا توجد صورة إشعار مرفقة مع هذه المحاولة (طريقة فيزا عادةً).
          </p>
        )}

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="ملاحظة اختيارية على القرار..."
          rows={2}
          className={`w-full resize-none ${inputBaseClass}`}
        />

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDecision(false)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600
              transition-all duration-300 hover:scale-[1.02] hover:bg-rose-50 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            رفض
          </button>
          <button
            type="button"
            onClick={() => handleDecision(true)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
              duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "اعتماد الدفع"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
