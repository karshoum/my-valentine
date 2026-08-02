// File: frontend/src/features/public/usePublicShipRoutes.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ShipRouteOut } from "@/types/shipRoute";

/** يجلب خطوط البواخر المفعَّلة عبر المسار العام (بلا حاجة لتسجيل دخول). */
export function usePublicShipRoutes() {
  const [routes, setRoutes] = useState<ShipRouteOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get<ShipRouteOut[]>("/api/v1/ship-routes/")
      .then((response) => setRoutes(response.data))
      .catch(() => setError("تعذّر جلب خطوط البواخر"))
      .finally(() => setIsLoading(false));
  }, []);

  return { routes, isLoading, error };
}
