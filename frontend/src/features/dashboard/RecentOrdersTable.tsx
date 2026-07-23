// File: frontend/src/features/dashboard/RecentOrdersTable.tsx

import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { orderStatusColorMap } from "@/lib/designTokens";
import type { OrderOut } from "@/types/order";

/** جدول تفاعلي لأحدث الطلبات، مع شارات تصفية سريعة (Filter Pills) حسب الحالة. */
export function RecentOrdersTable({ orders }: { orders: OrderOut[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredOrders = useMemo(
    () => (activeFilter ? orders.filter((order) => order.status === activeFilter) : orders),
    [orders, activeFilter],
  );

  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill label="الكل" isActive={activeFilter === null} onClick={() => setActiveFilter(null)} />
        {Object.entries(orderStatusColorMap).map(([status, config]) => (
          <FilterPill
            key={status}
            label={config.label}
            isActive={activeFilter === status}
            onClick={() => setActiveFilter(status)}
          />
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-xs text-slate-500">
              <th className="px-3 py-2 font-medium">رقم الطلب</th>
              <th className="px-3 py-2 font-medium">المبلغ</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                <td className="px-3 py-3 font-medium text-slate-800">{order.order_number}</td>
                <td className="px-3 py-3 text-slate-600">
                  {order.total_amount} {order.currency_code}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-3 py-3 text-slate-500">{new Date(order.created_at).toLocaleDateString("ar")}</td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-400">
                  لا توجد طلبات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
        isActive ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
