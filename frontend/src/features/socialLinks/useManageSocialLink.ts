// File: frontend/src/features/socialLinks/useManageSocialLink.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { SocialLinkCreateRequest, SocialLinkOut, SocialLinkUpdateRequest } from "@/types/socialLink";

/** ينشئ، يعدّل، ويحذف روابط التواصل الاجتماعي (admin فقط)، مع حالتي التحميل والخطأ. */
export function useManageSocialLink() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLink = async (payload: SocialLinkCreateRequest): Promise<SocialLinkOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<SocialLinkOut>("/api/v1/social-links", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إضافة رابط التواصل"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLink = async (linkId: number, payload: SocialLinkUpdateRequest): Promise<SocialLinkOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<SocialLinkOut>(`/api/v1/social-links/${linkId}`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تعديل رابط التواصل"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLink = async (linkId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/social-links/${linkId}`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حذف رابط التواصل"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createLink, updateLink, deleteLink, isSubmitting, error };
}
