// File: frontend/src/lib/formatServicePrice.ts

import type { ServiceOut } from "@/types/service";

/** يُنسّق السعر الفعلي الحالي للخدمة: بعملتها المثبَّتة إن وُجدت (بلا تحويل)، وإلا بعملة عرض الزائر عبر formatUsd. */
export function formatServicePrice(service: ServiceOut, formatUsd: (amount: string | number) => string): string {
  if (service.pinned_currency_code && service.effective_pinned_price_amount) {
    return `${Number(service.effective_pinned_price_amount).toFixed(2)} ${service.pinned_currency_code}`;
  }
  return formatUsd(service.effective_price_usd);
}

/** يُنسّق السعر الأساسي (قبل الخصم) للخدمة، لعرضه مشطوباً عند وجود خصم ساري. */
export function formatServiceBasePrice(service: ServiceOut, formatUsd: (amount: string | number) => string): string {
  if (service.pinned_currency_code && service.pinned_price_amount) {
    return `${Number(service.pinned_price_amount).toFixed(2)} ${service.pinned_currency_code}`;
  }
  return formatUsd(service.base_price_usd);
}
