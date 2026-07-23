// File: frontend/src/features/currencies/CurrenciesTable.tsx

import { Pencil } from "lucide-react";

import type { CurrencyOut } from "@/types/currency";

interface CurrenciesTableProps {
  currencies: CurrencyOut[];
  onSelectCurrency: (currency: CurrencyOut) => void;
}

/** جدول العملات المسجَّلة مع آخر سعر صرف وتاريخ ومصدر آخر تحديث. */
export function CurrenciesTable({ currencies, onSelectCurrency }: CurrenciesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-xs text-slate-500">
            <th className="px-4 py-3 font-medium">الرمز</th>
            <th className="px-4 py-3 font-medium">الاسم</th>
            <th className="px-4 py-3 font-medium">السعر مقابل الدولار</th>
            <th className="px-4 py-3 font-medium">آخر تحديث</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {currencies.map((currency) => (
            <tr
              key={currency.id}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/80"
              onClick={() => onSelectCurrency(currency)}
            >
              <td className="px-4 py-3 font-semibold text-slate-800">{currency.code}</td>
              <td className="px-4 py-3 text-slate-600">{currency.name}</td>
              <td className="px-4 py-3 text-slate-600">{currency.rate_to_usd}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(currency.updated_at).toLocaleString("ar")}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
                  <Pencil size={12} />
                  تحديث
                </span>
              </td>
            </tr>
          ))}
          {currencies.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                لا توجد عملات مسجَّلة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
