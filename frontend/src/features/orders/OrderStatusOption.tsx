// File: frontend/src/features/orders/OrderStatusOption.tsx

import { CheckCircle2, Circle } from "lucide-react";

import { orderStatusColorMap } from "@/lib/designTokens";
import { orderStatusDescriptions } from "@/lib/orderStatusDescriptions";
import type { OrderStatus } from "@/types/enums";

interface OrderStatusOptionProps {
  status: OrderStatus;
  isSelected: boolean;
  onSelect: (status: OrderStatus) => void;
}

/**
 * خيار حالة واحد في نموذج تحديث حالة الطلب: صف كامل العرض بدائرة اختيار
 * واضحة واسم الحالة وشرح معناها — بدل شارة صغيرة يصعب تمييز كونها
 * "اختياراً" لا "حالة قائمة".
 */
export function OrderStatusOption({ status, isSelected, onSelect }: OrderStatusOptionProps) {
  const { dot, label } = orderStatusColorMap[status] ?? orderStatusColorMap.pending;

  return (
    <button
      type="button"
      onClick={() => onSelect(status)}
      className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-start transition-all duration-200 ${
        isSelected
          ? "border-navy-500 bg-navy-50/80 ring-1 ring-navy-500/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {isSelected ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-navy-600" />
      ) : (
        <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />
      )}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span className={`text-sm font-semibold ${isSelected ? "text-navy-800" : "text-slate-800"}`}>{label}</span>
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{orderStatusDescriptions[status]}</span>
      </span>
    </button>
  );
}
