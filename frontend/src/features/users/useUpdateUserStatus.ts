// File: frontend/src/features/users/useUpdateUserStatus.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { UserOut } from "@/types/user";

/** يُفعّل أو يوقف حساب مستخدم آخر (admin فقط)، مع حالتي التحميل والخطأ. */
export function useUpdateUserStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (userId: number, isActive: boolean): Promise<UserOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<UserOut>(`/api/v1/users/${userId}/status`, { is_active: isActive });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث حالة الحساب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateStatus, isSubmitting, error };
}
