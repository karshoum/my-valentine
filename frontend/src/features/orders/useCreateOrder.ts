// File: frontend/src/features/orders/useCreateOrder.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { OrderCreateRequest, OrderOut } from "@/types/order";

/** ينشئ طلباً جديداً (حجز خدمة) للمستخدم الحالي، بحالة pending دائماً. */
export function useCreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (payload: OrderCreateRequest): Promise<OrderOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<OrderOut>("/api/v1/orders", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إنشاء الطلب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createOrder, isSubmitting, error };
}
