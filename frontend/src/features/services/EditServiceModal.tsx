// File: frontend/src/features/services/EditServiceModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useUpdateService } from "@/features/services/useUpdateService";
import { inputBaseClass } from "@/lib/designTokens";
import type { ServiceOut } from "@/types/service";

interface EditServiceModalProps {
  service: ServiceOut;
  onClose: () => void;
  onUpdated: (service: ServiceOut) => void;
}

/** نموذج تعديل عنوان/وصف/سعر/حالة تفعيل خدمة قائمة (موظف أو مدير). */
export function EditServiceModal({ service, onClose, onUpdated }: EditServiceModalProps) {
  const { updateService, isSubmitting, error } = useUpdateService();
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description ?? "");
  const [basePrice, setBasePrice] = useState(service.base_price_usd);
  const [isActive, setIsActive] = useState(service.is_active);

  const handleSubmit = async () => {
    const updated = await updateService(service.id, {
      title,
      description: description || null,
      base_price_usd: basePrice,
      is_active: isActive,
    });
    if (updated) onUpdated(updated);
  };

  return (
    <Modal title={`تعديل: ${service.title}`} onClose={onClose}>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان الخدمة"
          className={`w-full ${inputBaseClass}`}
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="وصف اختياري"
          rows={2}
          className={`w-full ${inputBaseClass}`}
        />

        <input
          value={basePrice}
          onChange={(event) => setBasePrice(event.target.value)}
          type="number"
          step="0.01"
          placeholder="السعر الأساسي (دولار)"
          className={`w-full ${inputBaseClass}`}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500/40"
          />
          الخدمة مفعَّلة (تظهر للعملاء)
        </label>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !title}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </Modal>
  );
}
