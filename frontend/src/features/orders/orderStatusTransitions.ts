// File: frontend/src/features/orders/orderStatusTransitions.ts

import type { OrderStatus } from "@/types/enums";

/** مطابقة تماماً لـ ALLOWED_TRANSITIONS في app/services/order_service.py. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "rejected"],
  processing: ["in_system", "rejected"],
  in_system: ["completed"],
  completed: ["refunded"],
  rejected: [],
  refunded: [],
};

/** يُعيد قائمة الحالات المسموح الانتقال إليها من الحالة الحالية للطلب. */
export function getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] ?? [];
}
