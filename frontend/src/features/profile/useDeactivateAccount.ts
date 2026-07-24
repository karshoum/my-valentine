// File: frontend/src/features/profile/useDeactivateAccount.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { AccountDeactivationRequest } from "@/types/user";

/** يوقف حساب المستخدم الحالي ذاتياً بعد تأكيد كلمة المرور، مع حالتي التحميل والخطأ. */
export function useDeactivateAccount() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivateAccount = async (payload: AccountDeactivationRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/api/v1/users/me/deactivate", payload);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إيقاف الحساب"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { deactivateAccount, isSubmitting, error };
}
