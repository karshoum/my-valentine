// File: frontend/src/features/refunds/RefundReviewModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/features/auth/useAuth";
import { useDecideRefund } from "@/features/refunds/useDecideRefund";
import { useProcessRefund } from "@/features/refunds/useProcessRefund";
import { inputBaseClass } from "@/lib/designTokens";
import { refundStatusDisplay } from "@/lib/refundStatusLabels";
import type { RefundOut } from "@/types/refund";

interface RefundReviewModalProps {
  refund: RefundOut;
  onClose: () => void;
  onDecided: () => void;
}

/** نافذة مراجعة/اعتماد/تنفيذ طلب استرداد. الإجراءات (اعتماد/رفض/تنفيذ) محصورة بحساب admin فقط. */
export function RefundReviewModal({ refund, onClose, onDecided }: RefundReviewModalProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { approveRefund, declineRefund, isSubmitting: isDeciding, error: decideError } = useDecideRefund();
  const { processRefund, isSubmitting: isProcessing, error: processError } = useProcessRefund();
  const [notes, setNotes] = useState("");

  const handleApprove = async () => {
    const result = await approveRefund(refund.id);
    if (result) onDecided();
  };

  const handleDecline = async () => {
    const result = await declineRefund(refund.id, notes.trim() || null);
    if (result) onDecided();
  };

  const handleProcess = async () => {
    const result = await processRefund(refund.id);
    if (result) onDecided();
  };

  const display = refundStatusDisplay[refund.status];

  return (
    <Modal title={`طلب استرداد: ${refund.order_number}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-800">المبلغ:</span> {refund.refund_amount} {refund.currency_code}
          </p>
          {refund.reason && (
            <p className="mt-1">
              <span className="font-medium text-slate-800">السبب:</span> {refund.reason}
            </p>
          )}
          <p className="mt-1">
            <span className="font-medium text-slate-800">الحالة الحالية:</span>{" "}
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${display.badgeClass}`}>
              {display.label}
            </span>
          </p>
        </div>

        {!isAdmin && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            اعتماد/رفض/تنفيذ الاسترداد يتطلّب صلاحية مدير تنفيذي (admin).
          </p>
        )}

        {isAdmin && refund.status === "pending" && (
          <>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="ملاحظة الرفض (اختياري)..."
              rows={2}
              className={`w-full resize-none ${inputBaseClass}`}
            />
            {decideError && <p className="text-xs text-rose-600">{decideError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDecline}
                disabled={isDeciding}
                className="flex-1 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600
                  transition-all duration-300 hover:scale-[1.02] hover:bg-rose-50 active:scale-[0.98] disabled:cursor-not-allowed
                  disabled:opacity-60"
              >
                رفض
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isDeciding}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
                  duration-300 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed
                  disabled:opacity-60"
              >
                {isDeciding ? "جارٍ الحفظ..." : "اعتماد الطلب"}
              </button>
            </div>
          </>
        )}

        {isAdmin && refund.status === "approved" && (
          <>
            {processError && <p className="text-xs text-rose-600">{processError}</p>}
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
                duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed
                disabled:opacity-60"
            >
              {isProcessing ? "جارٍ التنفيذ..." : "تنفيذ الاسترداد الآن"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
