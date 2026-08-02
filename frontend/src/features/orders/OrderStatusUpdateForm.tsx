// File: frontend/src/features/orders/OrderStatusUpdateForm.tsx

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllowedNextStatuses } from "@/features/orders/orderStatusTransitions";
import { OrderStatusOption } from "@/features/orders/OrderStatusOption";
import { useUpdateOrderStatus } from "@/features/orders/useUpdateOrderStatus";
import { inputBaseClass, orderStatusColorMap } from "@/lib/designTokens";
import { TERMINAL_ORDER_STATUSES } from "@/lib/orderStatusDescriptions";
import type { OrderStatus } from "@/types/enums";
import type { OrderOut } from "@/types/order";

interface OrderStatusUpdateFormProps {
  order: OrderOut;
  onUpdated: (updatedOrder: OrderOut) => void;
}

/**
 * نموذج نقل حالة طلب (موظف/مدير فقط): يعرض الحالة الحالية بوضوح، ثم
 * الحالات التالية المسموحة كخيارات صريحة مشروحة بلا اختيار مُسبَق، مع
 * معاينة الانتقال (من ← إلى) وتأكيد نهائي قبل التطبيق.
 */
export function OrderStatusUpdateForm({ order, onUpdated }: OrderStatusUpdateFormProps) {
  const allowedNextStatuses = getAllowedNextStatuses(order.status);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { updateStatus, isSubmitting, error } = useUpdateOrderStatus();

  if (allowedNextStatuses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">حالة الطلب</p>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="text-xs text-slate-500">حالة نهائية — لا يمكن تغييرها</span>
        </div>
      </div>
    );
  }

  const currentLabel = orderStatusColorMap[order.status]?.label ?? order.status;
  const selectedLabel = selectedStatus ? (orderStatusColorMap[selectedStatus]?.label ?? selectedStatus) : "";
  const isTerminalTarget = selectedStatus !== null && TERMINAL_ORDER_STATUSES.includes(selectedStatus);

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    const updatedOrder = await updateStatus(order.id, selectedStatus, notes || null);
    if (updatedOrder) {
      onUpdated(updatedOrder);
      setNotes("");
      setSelectedStatus(null);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <p className="text-sm font-bold text-slate-800">تحديث حالة الطلب</p>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <span className="text-xs text-slate-500">الحالة الحالية:</span>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">اختر الحالة الجديدة التي تريد نقل الطلب إليها:</p>
        {allowedNextStatuses.map((status) => (
          <OrderStatusOption
            key={status}
            status={status}
            isSelected={selectedStatus === status}
            onSelect={setSelectedStatus}
          />
        ))}
      </div>

      {selectedStatus && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-navy-100 bg-navy-50/60 px-3 py-2">
          <span className="text-sm font-medium text-slate-600">{currentLabel}</span>
          <ArrowLeft size={15} className="shrink-0 text-navy-500" />
          <span className="text-sm font-bold text-navy-800">{selectedLabel}</span>
        </div>
      )}

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="ملاحظة اختيارية على هذا التغيير (تظهر في سجل الحالات)..."
        rows={2}
        className={`w-full resize-none ${inputBaseClass}`}
      />

      {error && !isConfirmOpen && <p className="text-xs text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        disabled={!selectedStatus || isSubmitting}
        className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
          duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
          disabled:opacity-60 disabled:hover:scale-100"
      >
        {selectedStatus ? `نقل الطلب إلى «${selectedLabel}»` : "اختر الحالة الجديدة أولاً"}
      </button>

      {isConfirmOpen && selectedStatus && (
        <ConfirmDialog
          title="تأكيد تغيير حالة الطلب"
          message={
            `سيتم نقل الطلب ${order.order_number} من "${currentLabel}" إلى "${selectedLabel}".` +
            (isTerminalTarget ? " هذه حالة نهائية لا يمكن التراجع عنها بعد التأكيد." : "")
          }
          confirmLabel="تأكيد النقل"
          isConfirming={isSubmitting}
          errorMessage={error}
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}
