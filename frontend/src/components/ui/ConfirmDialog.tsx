// File: frontend/src/components/ui/ConfirmDialog.tsx

import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** نافذة تأكيد موحّدة لأي إجراء حساس أو نهائي (حذف، إلخ) عبر المنصة. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "تأكيد",
  isConfirming = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>

        {errorMessage && <p className="text-xs text-rose-600">{errorMessage}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600
              transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.98]"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
              duration-300 hover:scale-[1.02] hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            {isConfirming ? "جارٍ التنفيذ..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
