// File: frontend/src/features/services/useServices.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ServiceOut } from "@/types/service";

/** يجلب كل الخدمات المفعَّلة (عام، بلا حاجة لتسجيل دخول). */
export function useServices() {
  const [services, setServices] = useState<ServiceOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<ServiceOut[]>("/api/v1/services")
      .then((response) => {
        if (isMounted) setServices(response.data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, isLoading };
}
