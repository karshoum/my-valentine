// File: frontend/src/features/payments/usePayments.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { PaymentStatus } from "@/types/enums";
import type { PaymentOut } from "@/types/payment";

/** يجلب محاولات الدفع لأغراض المراجعة، مع تصفية اختيارية حسب الحالة (موظف/مدير فقط). */
export function usePayments(statusFilter: PaymentStatus | null = "pending") {
  const [payments, setPayments] = useState<PaymentOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<PaymentOut[]>("/api/v1/payments", { params: statusFilter ? { status_filter: statusFilter } : {} })
      .then((response) => setPayments(response.data))
      .catch(() => setError("تعذّر جلب المدفوعات من الخادم"))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { payments, isLoading, error, refetch };
}
