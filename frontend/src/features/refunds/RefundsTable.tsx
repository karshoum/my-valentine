// File: frontend/src/features/refunds/RefundsTable.tsx

import { refundStatusDisplay } from "@/lib/refundStatusLabels";
import type { RefundOut } from "@/types/refund";

interface RefundsTableProps {
  refunds: RefundOut[];
  onSelectRefund: (refund: RefundOut) => void;
}

/** جدول طلبات الاسترداد المطلوب مراجعتها، كل صف قابل للنقر لفتح شاشة المراجعة/التنفيذ. */
export function RefundsTable({ refunds, onSelectRefund }: RefundsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-xs text-slate-500">
            <th className="px-4 py-3 font-medium">رقم الطلب</th>
            <th className="px-4 py-3 font-medium">المبلغ</th>
            <th className="px-4 py-3 font-medium">السبب</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {refunds.map((refund) => {
            const display = refundStatusDisplay[refund.status];
            return (
              <tr
                key={refund.id}
                onClick={() => onSelectRefund(refund)}
                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{refund.order_number}</td>
                <td className="px-4 py-3 text-slate-600">
                  {refund.refund_amount} {refund.currency_code}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-500">{refund.reason ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${display.badgeClass}`}>
                    {display.label}
                  </span>
                </td>
              </tr>
            );
          })}
          {refunds.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                لا توجد طلبات استرداد مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
