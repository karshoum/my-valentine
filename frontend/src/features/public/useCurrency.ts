// File: frontend/src/features/public/useCurrency.ts

import { useContext } from "react";

import { CurrencyContext, type CurrencyContextValue } from "@/features/public/currencyContextValue";

/** يُستخدَم داخل شجرة CurrencyProvider فقط لعرض/تحويل الأسعار حسب عملة الزائر الحالية. */
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency يجب أن يُستخدَم داخل CurrencyProvider");
  return context;
}
