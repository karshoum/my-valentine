// File: frontend/src/features/services/useDeleteService.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";

/** يحذف خدمة نهائياً من الكتالوج (admin فقط)؛ يُرفض الحذف إذا كانت مرتبطة بطلبات سابقة. */
export function useDeleteService() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteService = async (serviceId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.delete(`/api/v1/services/${serviceId}`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حذف الخدمة"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { deleteService, isSubmitting, error };
}
