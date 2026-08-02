// File: frontend/src/features/orders/useUpdateOrderStatus.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { OrderOut, OrderStatusUpdateRequest } from "@/types/order";
import type { OrderStatus } from "@/types/enums";

/** يوفّر دالة لتنفيذ انتقال حالة طلب (موظف/مدير فقط) مع حالتي التحميل والخطأ. */
export function useUpdateOrderStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
    notes: string | null,
  ): Promise<OrderOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: OrderStatusUpdateRequest = { new_status: newStatus, notes };
      const response = await apiClient.patch<OrderOut>(`/api/v1/orders/${orderId}/status`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث حالة الطلب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateStatus, isSubmitting, error };
}
