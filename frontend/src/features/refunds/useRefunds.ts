// File: frontend/src/features/refunds/useRefunds.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { RefundStatus } from "@/types/enums";
import type { RefundOut } from "@/types/refund";

/** يجلب طلبات الاسترداد لأغراض المراجعة، مع تصفية اختيارية حسب الحالة (موظف/مدير فقط). */
export function useRefunds(statusFilter: RefundStatus | null = "pending") {
  const [refunds, setRefunds] = useState<RefundOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<RefundOut[]>("/api/v1/refunds", { params: statusFilter ? { status_filter: statusFilter } : {} })
      .then((response) => setRefunds(response.data))
      .catch(() => setError("تعذّر جلب طلبات الاسترداد من الخادم"))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { refunds, isLoading, error, refetch };
}
