// File: frontend/src/features/users/usePromoteToStaff.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { StaffPromoteRequest, UserOut } from "@/types/user";

/** يرقّي حساب عميل عادي موجود إلى موظف أو مدير (admin فقط)، مع حالتي التحميل والخطأ. */
export function usePromoteToStaff() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promoteToStaff = async (payload: StaffPromoteRequest): Promise<UserOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<UserOut>("/api/v1/users/promote", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر ترقية الحساب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { promoteToStaff, isSubmitting, error };
}
