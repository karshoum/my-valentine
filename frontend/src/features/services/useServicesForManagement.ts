// File: frontend/src/features/services/useServicesForManagement.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ServiceOut } from "@/types/service";

/** يجلب كل خدمات الكتالوج (مفعَّلة وغير مفعَّلة) لأغراض الإدارة (موظف أو مدير فقط). */
export function useServicesForManagement() {
  const [services, setServices] = useState<ServiceOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<ServiceOut[]>("/api/v1/services/manage/all")
      .then((response) => setServices(response.data))
      .catch(() => setError("تعذّر جلب الخدمات من الخادم"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { services, isLoading, error, refetch };
}
