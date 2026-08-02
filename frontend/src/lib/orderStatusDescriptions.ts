// File: frontend/src/lib/orderStatusDescriptions.ts

import type { OrderStatus } from "@/types/enums";

/** شرح مختصر لمعنى كل حالة طلب، يظهر للموظف عند اختيار الحالة الجديدة حتى يعرف أثر اختياره بدقة. */
export const orderStatusDescriptions: Record<OrderStatus, string> = {
  pending: "الطلب وصل ولم يبدأ العمل عليه بعد",
  processing: "بدأ الموظف العمل على الطلب فعلياً",
  in_system: "أُدخل الطلب في نظام الجهة المختصة وبانتظار صدوره",
  completed: "اكتمل الطلب وسُلِّم للعميل نهائياً",
  rejected: "رُفض الطلب ولن يُستكمل",
  refunded: "أُعيد المبلغ للعميل",
};

/**
 * الحالات النهائية فعلاً (لا يوجد أي انتقال مسموح بعدها في
 * ALLOWED_TRANSITIONS)، تستحق تحذيراً أقوى قبل التأكيد. "مكتمل" ليست
 * منها لأنه ما زال يمكن نقلها إلى "مسترجَع".
 */
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["rejected", "refunded"];
