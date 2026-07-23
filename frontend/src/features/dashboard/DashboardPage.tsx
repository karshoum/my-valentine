// File: frontend/src/features/dashboard/DashboardPage.tsx

import { CheckCircle2, Clock, ListOrdered, Wallet } from "lucide-react";
import { useMemo } from "react";

import { KpiCard } from "@/components/ui/KpiCard";
import { RecentOrdersTable } from "@/features/dashboard/RecentOrdersTable";
import { useOrders } from "@/features/dashboard/useOrders";

/** الصفحة الرئيسية للوحة التحكم: كروت مؤشرات الأداء وجدول أحدث الطلبات. */
export function DashboardPage() {
  const { orders, isLoading, error } = useOrders();

  const kpis = useMemo(() => {
    const pendingCount = orders.filter((order) => order.status === "pending").length;
    const completedCount = orders.filter((order) => order.status === "completed").length;
    const totalUsd = orders
      .filter((order) => order.currency_code === "USD")
      .reduce((sum, order) => sum + Number(order.total_amount), 0);

    return { pendingCount, completedCount, totalUsd, totalOrders: orders.length };
  }, [orders]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">جارٍ تحميل البيانات...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">نظرة عامة</h1>
        <p className="text-sm text-slate-500">ملخص أداء المنصة الحالي</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="إجمالي الطلبات" value={String(kpis.totalOrders)} icon={ListOrdered} accent="violet" />
        <KpiCard label="قيد الانتظار" value={String(kpis.pendingCount)} icon={Clock} accent="violet" />
        <KpiCard label="طلبات مكتملة" value={String(kpis.completedCount)} icon={CheckCircle2} accent="emerald" />
        <KpiCard
          label="إجمالي المبالغ (USD)"
          value={`$${kpis.totalUsd.toLocaleString()}`}
          icon={Wallet}
          accent="emerald"
          changePercent={0}
        />
      </div>

      <RecentOrdersTable orders={orders} />
    </div>
  );
}
