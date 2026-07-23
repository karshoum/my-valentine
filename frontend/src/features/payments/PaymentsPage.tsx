// File: frontend/src/features/payments/PaymentsPage.tsx

import { useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { PaymentReviewModal } from "@/features/payments/PaymentReviewModal";
import { PaymentsTable } from "@/features/payments/PaymentsTable";
import { usePayments } from "@/features/payments/usePayments";
import type { PaymentStatus } from "@/types/enums";
import type { PaymentOut } from "@/types/payment";

const FILTERS: { label: string; value: PaymentStatus | null }[] = [
  { label: "قيد المراجعة", value: "pending" },
  { label: "معتمَدة", value: "verified" },
  { label: "مرفوضة", value: "rejected" },
  { label: "الكل", value: null },
];

/** شاشة مراجعة المدفوعات: طابور عمل الموظف/المدير للتحقق اليدوي من إثباتات الدفع. */
export function PaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | null>("pending");
  const { payments, isLoading, error, refetch } = usePayments(activeFilter);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOut | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">المدفوعات</h1>
        <p className="text-sm text-slate-500">المراجعة اليدوية الإلزامية لإثباتات الدفع قبل تأكيد أي طلب</p>
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
        <p className="text-sm text-slate-500">جارٍ تحميل المدفوعات...</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : (
        <PaymentsTable payments={payments} onSelectPayment={setSelectedPayment} />
      )}

      {selectedPayment && (
        <PaymentReviewModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onReviewed={() => {
            setSelectedPayment(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
