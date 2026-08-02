// File: frontend/src/lib/apiClient.ts

import axios, { type AxiosInstance } from "axios";

import { clearAuthSession, getStoredToken } from "@/lib/authStorage";

/** عنوان الخلفية (Backend) الأساسي، من متغير بيئة Vite أو localhost افتراضياً. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/** نسخة axios موحّدة تُرفق توكن JWT تلقائياً وتتعامل مع انتهاء الجلسة. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * يحوّل رابط ملف موقّع (نسبي، مثال: /api/v1/files/...) إلى رابط كامل
 * يشير للخلفية الفعلية، لأن الفرونت‌إند والخلفية على منفذين مختلفين.
 */
export function buildFileUrl(signedUrl: string): string {
  return signedUrl.startsWith("http") ? signedUrl : `${API_BASE_URL}${signedUrl}`;
}
