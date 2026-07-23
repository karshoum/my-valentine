// File: frontend/src/features/currencies/useCurrencies.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { CurrencyOut } from "@/types/currency";

/** يجلب كل العملات المسجَّلة في النظام، مع إمكانية إعادة الجلب. */
export function useCurrencies() {
  const [currencies, setCurrencies] = useState<CurrencyOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<CurrencyOut[]>("/api/v1/currencies")
      .then((response) => setCurrencies(response.data))
      .catch(() => setError("تعذّر جلب العملات من الخادم"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { currencies, isLoading, error, refetch };
}
