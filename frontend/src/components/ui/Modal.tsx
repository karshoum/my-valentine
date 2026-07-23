// File: frontend/src/components/ui/Modal.tsx

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** نافذة منبثقة مركزية موحّدة (Modal) للنماذج القصيرة عبر المنصة. */
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
