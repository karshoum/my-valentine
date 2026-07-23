// File: frontend/src/features/orders/OrderStatusUpdateForm.tsx

import { useState } from "react";

import { inputBaseClass, orderStatusColorMap } from "@/lib/designTokens";
import { getAllowedNextStatuses } from "@/features/orders/orderStatusTransitions";
import { useUpdateOrderStatus } from "@/features/orders/useUpdateOrderStatus";
import type { OrderOut } from "@/types/order";

interface OrderStatusUpdateFormProps {
  order: OrderOut;
  onUpdated: (updatedOrder: OrderOut) => void;
}

/** نموذج انتقال حالة طلب (موظف/مدير فقط)، يعرض فقط الحالات التالية المسموحة. */
export function OrderStatusUpdateForm({ order, onUpdated }: OrderStatusUpdateFormProps) {
  const allowedNextStatuses = getAllowedNextStatuses(order.status);
  const [selectedStatus, setSelectedStatus] = useState(allowedNextStatuses[0] ?? "");
  const [notes, setNotes] = useState("");
  const { updateStatus, isSubmitting, error } = useUpdateOrderStatus();

  if (allowedNextStatuses.length === 0) {
    return <p className="text-sm text-slate-400">هذه الحالة نهائية ولا يمكن تغييرها</p>;
  }

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    const updatedOrder = await updateStatus(order.id, selectedStatus as OrderOut["status"], notes || null);
    if (updatedOrder) {
      onUpdated(updatedOrder);
      setNotes("");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-700">تحديث حالة الطلب</p>

      <div className="flex flex-wrap gap-2">
        {allowedNextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
              selectedStatus === status
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {orderStatusColorMap[status]?.label ?? status}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="ملاحظة اختيارية على هذا التغيير..."
        rows={2}
        className={`w-full resize-none ${inputBaseClass}`}
      />

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ التحديث..." : "تأكيد التحديث"}
      </button>
    </div>
  );
}
