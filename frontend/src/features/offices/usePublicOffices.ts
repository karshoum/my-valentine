// File: frontend/src/features/offices/usePublicOffices.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { OfficeOut } from "@/types/office";

/** يجلب المكاتب المُفعَّلة فقط لعرضها في الصفحة العامة (عام، بلا تسجيل دخول). */
export function usePublicOffices() {
  const [offices, setOffices] = useState<OfficeOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<OfficeOut[]>("/api/v1/offices")
      .then((response) => setOffices(response.data))
      .catch(() => setOffices([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { offices, isLoading };
}
