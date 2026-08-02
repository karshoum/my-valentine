// File: frontend/src/features/public/CurrencySwitcher.tsx

import { useCurrency } from "@/features/public/useCurrency";

/** قائمة منسدلة صغيرة تسمح للزائر بتغيير عملة العرض يدوياً (تتجاوز الكشف التلقائي). */
export function CurrencySwitcher() {
  const { currencyCode, setCurrencyCode, availableCurrencyCodes } = useCurrency();

  if (availableCurrencyCodes.length <= 1) return null;

  return (
    <select
      value={currencyCode}
      onChange={(event) => setCurrencyCode(event.target.value)}
      title="عملة العرض"
      className="rounded-lg border border-slate-200 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-600
        transition-colors hover:bg-white"
    >
      {availableCurrencyCodes.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );
}
