// File: frontend/src/features/shipRoutes/useShipBookingFeeSetting.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ShipBookingFeeSettingOut, ShipBookingFeeUpdateRequest } from "@/types/shipBookingFee";

/** يجلب إعداد رسم حجز البواخر الحالي، ويوفّر دالة لتحديثه (admin فقط). */
export function useShipBookingFeeSetting() {
  const [setting, setSetting] = useState<ShipBookingFeeSettingOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setIsLoading(true);
    apiClient
      .get<ShipBookingFeeSettingOut>("/api/v1/ship-routes/fee-setting")
      .then((response) => setSetting(response.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(refetch, []);

  const updateSetting = async (payload: ShipBookingFeeUpdateRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<ShipBookingFeeSettingOut>("/api/v1/ship-routes/fee-setting", payload);
      setSetting(response.data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث رسم الحجز"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setting, isLoading, updateSetting, isSubmitting, error };
}
