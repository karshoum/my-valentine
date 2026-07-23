// File: frontend/src/components/ui/StatusBadge.tsx

import { orderStatusColorMap } from "@/lib/designTokens";
import type { OrderStatus } from "@/types/enums";

/** شارة حالة نابضة (Pulsing Badge) لعرض حالة الطلب بلون مميز ونقطة متوهجة. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const { dot, badge, label } = orderStatusColorMap[status] ?? orderStatusColorMap.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badge}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
      </span>
      {label}
    </span>
  );
}
