// File: frontend/src/features/orders/useAttachDeliverable.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { OrderOut } from "@/types/order";

/** يرفع ويربط المستند النهائي (تذكرة/فيزا) بطلب وصل لمرحلة "في السيستم" على الأقل (موظف/مدير). */
export function useAttachDeliverable() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachDeliverable = async (orderId: number, file: File): Promise<OrderOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("deliverable_file", file);

      const response = await apiClient.post<OrderOut>(`/api/v1/orders/${orderId}/deliverable`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر رفع المستند النهائي"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { attachDeliverable, isSubmitting, error };
}
