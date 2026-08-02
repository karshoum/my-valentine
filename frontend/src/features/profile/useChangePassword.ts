// File: frontend/src/features/profile/useChangePassword.ts

import { useState } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { PasswordChangeRequest, TokenResponse } from "@/types/user";

/**
 * يغيّر كلمة مرور المستخدم الحالي بعد التحقق من كلمة المرور القديمة.
 * تغيير كلمة المرور يُبطل كل توكن سابق في كل الأجهزة، لذا يستقبل هذا
 * الطلب توكناً جديداً فوراً ويحدّث به الجلسة الحالية حتى لا ينقطع
 * اتصال المستخدم نفسه.
 */
export function useChangePassword() {
  const { refreshToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const changePassword = async (payload: PasswordChangeRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.patch<TokenResponse>("/api/v1/users/me/password", payload);
      refreshToken(response.data.access_token);
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
