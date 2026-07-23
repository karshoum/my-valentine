// File: frontend/src/features/services/useManageRequirements.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ServiceRequirementCreateRequest, ServiceRequirementOut, ServiceRequirementUpdateRequest } from "@/types/service";

/** يوفّر عمليات إضافة/تعديل/حذف بنود متطلبات المستندات لخدمة (موظف أو مدير فقط). */
export function useManageRequirements() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRequirement = async (
    serviceId: number,
    payload: ServiceRequirementCreateRequest,
  ): Promise<ServiceRequirementOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<ServiceRequirementOut>(
        `/api/v1/services/${serviceId}/requirements`,
        payload,
      );
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّرت إضافة بند المتطلب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRequirement = async (
    requirementId: number,
    payload: ServiceRequirementUpdateRequest,
  ): Promise<ServiceRequirementOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<ServiceRequirementOut>(
        `/api/v1/services/requirements/${requirementId}`,
        payload,
      );
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث بند المتطلب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRequirement = async (requirementId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/services/requirements/${requirementId}`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حذف بند المتطلب"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addRequirement, updateRequirement, deleteRequirement, isSubmitting, error };
}
