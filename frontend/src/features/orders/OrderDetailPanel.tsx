// File: frontend/src/features/orders/OrderDetailPanel.tsx

import { X } from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/features/auth/useAuth";
import { OrderStatusTimeline } from "@/features/orders/OrderStatusTimeline";
import { OrderStatusUpdateForm } from "@/features/orders/OrderStatusUpdateForm";
import type { OrderOut } from "@/types/order";

interface OrderDetailPanelProps {
  order: OrderOut;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: OrderOut) => void;
}

/** لوحة جانبية تعرض تفاصيل طلب كاملة: المسافرون، الخط الزمني للحالة، وأداة تحديث الحالة للموظفين. */
export function OrderDetailPanel({ order, onClose, onOrderUpdated }: OrderDetailPanelProps) {
  const { role } = useAuth();
  const canManageStatus = role === "admin" || role === "employee";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-s border-white/20 bg-white/95 p-6 shadow-xl
          backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{order.order_number}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {order.total_amount} {order.currency_code}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <StatusBadge status={order.status} />
        </div>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">المسافرون ({order.passengers.length})</h3>
          <div className="space-y-2">
            {order.passengers.map((passenger) => (
              <div key={passenger.id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <p className="text-sm font-medium text-slate-800">{passenger.full_name}</p>
                {passenger.passport_number && (
                  <p className="mt-0.5 text-xs text-slate-500">جواز سفر: {passenger.passport_number}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">سجل الحالات</h3>
          <OrderStatusTimeline statusLogs={order.status_logs} />
        </section>

        {canManageStatus && (
          <section>
            <OrderStatusUpdateForm order={order} onUpdated={onOrderUpdated} />
          </section>
        )}
      </div>
    </div>
  );
}
