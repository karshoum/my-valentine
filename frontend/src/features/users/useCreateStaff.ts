// File: frontend/src/features/users/useCreateStaff.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { StaffCreateRequest, UserOut } from "@/types/user";

/** ينشئ حساب موظف أو مدير جديداً (admin فقط)، مع حالتي التحميل والخطأ. */
export function useCreateStaff() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStaff = async (payload: StaffCreateRequest): Promise<UserOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<UserOut>("/api/v1/users/staff", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إنشاء حساب الموظف"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createStaff, isSubmitting, error };
}
