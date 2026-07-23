// File: frontend/src/features/orders/OrdersPage.tsx

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { inputBaseClass, orderStatusColorMap } from "@/lib/designTokens";
import { NewOrderModal } from "@/features/orders/NewOrderModal";
import { OrderDetailPanel } from "@/features/orders/OrderDetailPanel";
import { OrdersTable } from "@/features/orders/OrdersTable";
import { useOrders } from "@/features/orders/useOrders";
import type { OrderOut } from "@/types/order";

/** الشاشة التفصيلية لكل الطلبات: إنشاء طلب جديد، بحث، تصفية حسب الحالة، وفتح لوحة تفاصيل لكل طلب. */
export function OrdersPage() {
  const { orders, isLoading, error, refetch } = useOrders();
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderOut | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => (activeFilter ? order.status === activeFilter : true))
      .filter((order) =>
        searchText.trim() ? order.order_number.toLowerCase().includes(searchText.trim().toLowerCase()) : true,
      );
  }, [orders, activeFilter, searchText]);

  const handleOrderUpdated = (updatedOrder: OrderOut) => {
    setSelectedOrder(updatedOrder);
    refetch();
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">جارٍ تحميل الطلبات...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">الطلبات</h1>
          <p className="text-sm text-slate-500">إدارة ومتابعة كل الطلبات وحالاتها</p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
            transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Plus size={16} />
          طلب جديد
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="ابحث برقم الطلب..."
            className={`w-full pe-9 ${inputBaseClass}`}
          />
        </div>

        <div className="flex flex-wrap gap-2">
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
      </div>

      <OrdersTable orders={filteredOrders} onSelectOrder={setSelectedOrder} />

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {isNewOrderModalOpen && (
        <NewOrderModal
          onClose={() => setIsNewOrderModalOpen(false)}
          onCreated={(order) => {
            setIsNewOrderModalOpen(false);
            refetch();
            setSelectedOrder(order);
          }}
        />
      )}
    </div>
  );
}
