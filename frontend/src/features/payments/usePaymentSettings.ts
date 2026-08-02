// File: frontend/src/features/payments/usePaymentSettings.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { PaymentSettingsOut, PaymentSettingsUpdateRequest } from "@/types/paymentSettings";

/** يجلب إعداد وسائل الدفع الحالي (رقم حساب بنكك، رقم واتساب الفيزا)، ويوفّر دالة لتحديثه (admin فقط). */
export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettingsOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setIsLoading(true);
    apiClient
      .get<PaymentSettingsOut>("/api/v1/payment-settings")
      .then((response) => setSettings(response.data))
      .catch(() => setError("تعذّر جلب إعداد وسائل الدفع"))
      .finally(() => setIsLoading(false));
  };

  useEffect(refetch, []);

  const updateSettings = async (payload: PaymentSettingsUpdateRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<PaymentSettingsOut>("/api/v1/payment-settings", payload);
      setSettings(response.data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث إعداد وسائل الدفع"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { settings, isLoading, updateSettings, isSubmitting, error };
}
