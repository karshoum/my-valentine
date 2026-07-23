// File: frontend/src/features/orders/OrderStatusTimeline.tsx

import { orderStatusColorMap } from "@/lib/designTokens";
import type { OrderStatusLogOut } from "@/types/order";

/** يعرض سجل تغييرات حالة طلب كخط زمني عمودي، بترتيب زمني تصاعدي. */
export function OrderStatusTimeline({ statusLogs }: { statusLogs: OrderStatusLogOut[] }) {
  if (statusLogs.length === 0) {
    return <p className="text-sm text-slate-400">لا يوجد سجل حالات بعد</p>;
  }

  const sortedLogs = [...statusLogs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <ol className="space-y-4">
      {sortedLogs.map((log, index) => {
        const config = orderStatusColorMap[log.new_status] ?? orderStatusColorMap.pending;
        return (
          <li key={log.id} className="relative flex gap-3 ps-1">
            {index < sortedLogs.length - 1 && (
              <span className="absolute right-[7px] top-5 h-full w-px bg-slate-200 rtl:right-[7px]" />
            )}
            <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${config.dot}`} />
            <div className="flex-1 pb-1">
              <p className="text-sm font-medium text-slate-800">
                {log.old_status ? `${orderStatusColorMap[log.old_status]?.label ?? log.old_status} ← ` : ""}
                {config.label}
              </p>
              {log.notes && <p className="mt-0.5 text-xs text-slate-500">{log.notes}</p>}
              <p className="mt-0.5 text-xs text-slate-400">{new Date(log.created_at).toLocaleString("ar")}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
