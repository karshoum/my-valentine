// File: frontend/src/features/refunds/RefundsPage.tsx

import { useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { RefundReviewModal } from "@/features/refunds/RefundReviewModal";
import { RefundsTable } from "@/features/refunds/RefundsTable";
import { useRefunds } from "@/features/refunds/useRefunds";
import type { RefundStatus } from "@/types/enums";
import type { RefundOut } from "@/types/refund";

const FILTERS: { label: string; value: RefundStatus | null }[] = [
  { label: "قيد المراجعة", value: "pending" },
  { label: "معتمَدة", value: "approved" },
  { label: "مرفوضة", value: "declined" },
  { label: "منفَّذة", value: "processed" },
  { label: "الكل", value: null },
];

/** شاشة مراجعة طلبات الاسترداد: اعتماد/رفض من المدير، ثم تنفيذ فعلي ينقل الطلب لحالة refunded. */
export function RefundsPage() {
  const [activeFilter, setActiveFilter] = useState<RefundStatus | null>("pending");
  const { refunds, isLoading, error, refetch } = useRefunds(activeFilter);
  const [selectedRefund, setSelectedRefund] = useState<RefundOut | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">المستردات</h1>
        <p className="text-sm text-slate-500">مراجعة طلبات استرداد العملاء والوكلاء، واعتمادها وتنفيذها</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <FilterPill
            key={filter.label}
            label={filter.label}
            isActive={activeFilter === filter.value}
            onClick={() => setActiveFilter(filter.value)}
          />
        ))}
      </div>

      {isLoading ? (
        <LoadingIndicator label="جارٍ تحميل طلبات الاسترداد..." />
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : (
        <RefundsTable refunds={refunds} onSelectRefund={setSelectedRefund} />
      )}

      {selectedRefund && (
        <RefundReviewModal
          refund={selectedRefund}
          onClose={() => setSelectedRefund(null)}
          onDecided={() => {
            setSelectedRefund(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
