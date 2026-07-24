// File: frontend/src/components/ui/Modal.tsx

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * نافذة منبثقة مركزية موحّدة (Modal) للنماذج القصيرة عبر المنصة.
 * محدودة بارتفاع الشاشة دائماً مع تمرير داخلي (overflow-y-auto) للمحتوى
 * — بدونها كانت النماذج الطويلة (زي "طلب جديد") تمتد خارج الشاشة على
 * الهاتف بلا أي طريقة للوصول لبقية الحقول.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-white/20 bg-white/95
          shadow-xl backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
