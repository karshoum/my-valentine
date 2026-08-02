// File: frontend/src/features/offices/useOffices.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { OfficeOut } from "@/types/office";

/** يجلب كل المكاتب (مفعَّلة وموقوفة) لإدارتها من لوحة التحكم (موظف أو مدير فقط). */
export function useOffices() {
  const [offices, setOffices] = useState<OfficeOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<OfficeOut[]>("/api/v1/offices/all");
      setOffices(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحميل المكاتب"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  return { offices, isLoading, error, refetch: fetchOffices };
}
