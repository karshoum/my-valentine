// File: frontend/src/features/orders/DeliverableUploadForm.tsx

import { UploadCloud } from "lucide-react";
import { useState } from "react";

import { useAttachDeliverable } from "@/features/orders/useAttachDeliverable";
import type { OrderOut } from "@/types/order";

interface DeliverableUploadFormProps {
  order: OrderOut;
  onUploaded: (updatedOrder: OrderOut) => void;
}

/**
 * نموذج رفع المستند النهائي (تذكرة/فيزا) بعد أن يُتمّ الموظف الحجز
 * الفعلي خارجياً — يظهر فقط لطلب وصل لمرحلة "في السيستم" على الأقل.
 */
export function DeliverableUploadForm({ order, onUploaded }: DeliverableUploadFormProps) {
  const { attachDeliverable, isSubmitting, error } = useAttachDeliverable();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const updatedOrder = await attachDeliverable(order.id, file);
    if (updatedOrder) onUploaded(updatedOrder);
  };

  return (
    <div className="space-y-3 rounded-xl border border-violet-200/80 bg-violet-50/50 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-violet-700">
        <UploadCloud size={16} />
        رفع المستند النهائي (تذكرة/فيزا)
      </p>
      <p className="text-xs text-slate-500">
        بعد إتمام الحجز الفعلي على الموقع الخارجي، ارفع هنا التذكرة/الفيزا/المستند الصادر ليصل للعميل.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="w-full text-sm text-slate-600 file:me-3 file:rounded-lg file:border-0 file:bg-violet-100
          file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-violet-700"
      />

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isSubmitting}
        className="w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الرفع..." : "رفع المستند"}
      </button>
    </div>
  );
}
