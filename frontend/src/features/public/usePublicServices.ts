// File: frontend/src/features/public/usePublicServices.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ServiceCategory } from "@/types/enums";
import type { ServiceOut } from "@/types/service";

/** يجلب كتالوج الخدمات المفعَّلة فقط، عبر المسار العام (بلا حاجة لتسجيل دخول). */
export function usePublicServices(category: ServiceCategory | null) {
  const [services, setServices] = useState<ServiceOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    apiClient
      .get<ServiceOut[]>("/api/v1/services", { params: category ? { category } : undefined })
      .then((response) => setServices(response.data))
      .catch(() => setError("تعذّر جلب الخدمات من الخادم"))
      .finally(() => setIsLoading(false));
  }, [category]);

  return { services, isLoading, error };
}
