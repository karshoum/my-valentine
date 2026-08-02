// File: frontend/src/features/orders/useOrders.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { OrderOut } from "@/types/order";

/** يجلب طلبات المستخدم الحالي (أو كل الطلبات لموظف/مدير) من الخلفية، مع إمكانية إعادة الجلب. */
export function useOrders() {
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<OrderOut[]>("/api/v1/orders")
      .then((response) => {
        setOrders(response.data);
      })
      .catch(() => {
        setError("تعذّر جلب الطلبات من الخادم");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<OrderOut[]>("/api/v1/orders")
      .then((response) => {
        if (isMounted) setOrders(response.data);
      })
      .catch(() => {
        if (isMounted) setError("تعذّر جلب الطلبات من الخادم");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { orders, isLoading, error, refetch };
}
