// File: frontend/src/features/profile/useChangePassword.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { PasswordChangeRequest } from "@/types/user";

/** يغيّر كلمة مرور المستخدم الحالي بعد التحقق من كلمة المرور القديمة. */
export function useChangePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const changePassword = async (payload: PasswordChangeRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiClient.patch("/api/v1/users/me/password", payload);
      setSuccessMessage("تم تغيير كلمة المرور بنجاح");
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تغيير كلمة المرور"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { changePassword, isSubmitting, error, successMessage };
}
