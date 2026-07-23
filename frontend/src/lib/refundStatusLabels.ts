// File: frontend/src/lib/refundStatusLabels.ts

import type { RefundStatus } from "@/types/enums";

/** الاسم والألوان الظاهرة بالعربية لكل حالة استرداد (مطابق لـ app.models.enums.RefundStatus). */
export const refundStatusDisplay: Record<RefundStatus, { label: string; badgeClass: string }> = {
  pending: { label: "قيد المراجعة", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "معتمَد (بانتظار التنفيذ)", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  declined: { label: "مرفوض", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
  processed: { label: "منفَّذ", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};
