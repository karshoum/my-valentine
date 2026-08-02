// File: frontend/src/features/profile/useUpdateProfile.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ProfileUpdateRequest, UserOut } from "@/types/user";

/** يعدّل بيانات ملف المستخدم الحالي الشخصي (الاسم/البريد/رقم واتساب)، مع حالتي التحميل والخطأ. */
export function useUpdateProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: ProfileUpdateRequest): Promise<UserOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<UserOut>("/api/v1/users/me", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث بيانات الحساب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateProfile, isSubmitting, error };
}
