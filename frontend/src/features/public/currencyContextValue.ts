// File: frontend/src/features/public/currencyContextValue.ts

import { createContext } from "react";

import type { CurrencyOut } from "@/types/currency";

/** دول الخليج ومصر تُعرَض بعملتها المحلية إن كانت مُضافة في شاشة العملات؛ غير ذلك دولار دائماً. */
export const LOCAL_CURRENCY_BY_COUNTRY: Record<string, string> = {
  SA: "SAR",
  AE: "AED",
  KW: "KWD",
  QA: "QAR",
  BH: "BHD",
  OM: "OMR",
  EG: "EGP",
};

export interface CurrencyContextValue {
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  availableCurrencyCodes: string[];
  formatUsd: (amountUsd: string | number) => string;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * يحدّد عملة العرض المناسبة لدولة الزائر: دول الخليج ومصر تحصل على
 * عملتها المحلية إن كانت مُضافة فعلياً في شاشة العملات، السودان يحصل
 * على الجنيه فقط إذا دخل المدير سعر صرفه يدوياً فعلاً (updated_by غير
 * فارغ — وليس مجرّد قيمة أولية من سكربت التهيئة)، وأي دولة أخرى تُعرَض
 * بالدولار دائماً.
 */
export function detectCurrencyForCountry(countryCode: string | undefined, currencies: CurrencyOut[]): string {
  if (!countryCode) return "USD";

  if (countryCode === "SD") {
    const sdg = currencies.find((currency) => currency.code === "SDG");
    return sdg && sdg.updated_by ? "SDG" : "USD";
  }

  const mappedCode = LOCAL_CURRENCY_BY_COUNTRY[countryCode];
  if (!mappedCode) return "USD";
  return currencies.some((currency) => currency.code === mappedCode) ? mappedCode : "USD";
}
