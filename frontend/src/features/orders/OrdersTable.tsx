// File: frontend/src/features/orders/OrdersTable.tsx

import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderOut } from "@/types/order";

interface OrdersTableProps {
  orders: OrderOut[];
  onSelectOrder: (order: OrderOut) => void;
}

/** جدول تفاعلي كامل للطلبات، كل صف قابل للنقر لفتح لوحة التفاصيل. */
export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-xs text-slate-500">
            <th className="px-4 py-3 font-medium">رقم الطلب</th>
            <th className="px-4 py-3 font-medium">المبلغ</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">عدد المسافرين</th>
            <th className="px-4 py-3 font-medium">تاريخ الإنشاء</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 font-medium text-slate-800">{order.order_number}</td>
              <td className="px-4 py-3 text-slate-600">
                {order.total_amount} {order.currency_code}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{order.passengers.length}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(order.created_at).toLocaleDateString("ar")}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                لا توجد طلبات مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
