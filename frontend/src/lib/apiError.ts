// File: frontend/src/lib/apiError.ts

/** يستخرج رسالة الخطأ العربية من استجابة AppException الموحّدة، أو رسالة احتياطية. */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return detail ?? fallback;
}
