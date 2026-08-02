// File: frontend/src/features/payments/PaymentsTable.tsx

import { paymentMethodLabels } from "@/lib/paymentMethodLabels";
import type { PaymentOut } from "@/types/payment";

interface PaymentsTableProps {
  payments: PaymentOut[];
  onSelectPayment: (payment: PaymentOut) => void;
}

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  verified: "معتمَد",
  rejected: "مرفوض",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-navy-50 text-navy-700 border-navy-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

/** جدول محاولات الدفع المطلوب مراجعتها، كل صف قابل للنقر لفتح شاشة المراجعة. */
export function PaymentsTable({ payments, onSelectPayment }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-xs text-slate-500">
            <th className="px-4 py-3 font-medium">رقم الطلب</th>
            <th className="px-4 py-3 font-medium">طريقة الدفع</th>
            <th className="px-4 py-3 font-medium">المبلغ</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">تاريخ الرفع</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              onClick={() => onSelectPayment(payment)}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 font-medium text-slate-800">{payment.order_number}</td>
              <td className="px-4 py-3 text-slate-600">{paymentMethodLabels[payment.payment_method]}</td>
              <td className="px-4 py-3 text-slate-600">
                {payment.amount} {payment.currency_code}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[payment.status]}`}>
                  {statusLabels[payment.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{new Date(payment.created_at).toLocaleString("ar")}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                لا توجد محاولات دفع مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
