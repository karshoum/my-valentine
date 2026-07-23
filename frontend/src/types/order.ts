// File: frontend/src/types/order.ts

import type { OrderStatus } from "@/types/enums";

/** مطابق لـ app.schemas.order.OrderPassengerIn. */
export interface OrderPassengerIn {
  full_name: string;
  passport_number: string | null;
}

/** مطابق لـ app.schemas.order.OrderCreateRequest. */
export interface OrderCreateRequest {
  service_id: number;
  currency_code: string;
  passengers: OrderPassengerIn[];
}

/** مطابق لـ app.schemas.order.OrderPassengerOut. */
export interface OrderPassengerOut {
  id: number;
  full_name: string;
  passport_number: string | null;
  passport_file_url: string | null;
}

/** مطابق لـ app.schemas.order.OrderStatusLogOut. */
export interface OrderStatusLogOut {
  id: number;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: number;
  notes: string | null;
  created_at: string;
}

/** مطابق لـ app.schemas.order.OrderStatusUpdateRequest. */
export interface OrderStatusUpdateRequest {
  new_status: OrderStatus;
  notes: string | null;
}

/** مطابق لـ app.schemas.order.OrderOut. */
export interface OrderOut {
  id: number;
  order_number: string;
  user_id: number;
  service_id: number;
  total_amount: string;
  currency_code: string;
  status: OrderStatus;
  created_at: string;
  deliverable_signed_url: string | null;
  passengers: OrderPassengerOut[];
  status_logs: OrderStatusLogOut[];
}
