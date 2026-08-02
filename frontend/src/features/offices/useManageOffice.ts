// File: frontend/src/features/offices/useManageOffice.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { OfficeCreateRequest, OfficeOut, OfficeUpdateRequest } from "@/types/office";

/** ينشئ، يعدّل، ويحذف مكاتب/فروع الوكالة (admin فقط)، مع حالتي التحميل والخطأ. */
export function useManageOffice() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffice = async (payload: OfficeCreateRequest): Promise<OfficeOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<OfficeOut>("/api/v1/offices", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إضافة المكتب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOffice = async (officeId: number, payload: OfficeUpdateRequest): Promise<OfficeOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<OfficeOut>(`/api/v1/offices/${officeId}`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تعديل المكتب"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteOffice = async (officeId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/offices/${officeId}`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حذف المكتب"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createOffice, updateOffice, deleteOffice, isSubmitting, error };
}
