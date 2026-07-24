// File: frontend/src/features/public/useShipRouteQuote.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ShipRouteQuoteOut } from "@/types/shipBookingFee";

/**
 * يجلب تفصيل سعر حجز خط باخرة (السعر الحقيقي + رسم الحجز بعد أي خصم
 * ساري) من الخادم عند تغيّر الخط أو عدد المسافرين — لا يُحسَب أي سعر
 * نهائي داخل المتصفح.
 */
export function useShipRouteQuote(routeId: number | null, adults: number, children: number, infants: number) {
  const [quote, setQuote] = useState<ShipRouteQuoteOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!routeId) {
      setQuote(null);
      return;
    }
    setIsLoading(true);
    apiClient
      .get<ShipRouteQuoteOut>(`/api/v1/ship-routes/${routeId}/quote`, { params: { adults, children, infants } })
      .then((response) => setQuote(response.data))
      .catch(() => setQuote(null))
      .finally(() => setIsLoading(false));
  }, [routeId, adults, children, infants]);

  return { quote, isLoading };
}
