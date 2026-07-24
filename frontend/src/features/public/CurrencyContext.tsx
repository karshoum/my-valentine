// File: frontend/src/features/public/CurrencyContext.tsx

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { CurrencyContext, detectCurrencyForCountry, type CurrencyContextValue } from "@/features/public/currencyContextValue";
import { apiClient } from "@/lib/apiClient";
import { detectVisitorCountryCode } from "@/lib/detectVisitorCountry";
import type { CurrencyOut } from "@/types/currency";

const STORAGE_KEY = "wakalat_paradise_currency_override";

/** يوفّر عملة العرض الحالية (مكتشَفة تلقائياً عبر IP أو مختارة يدوياً) لكل شاشات الزوار العامة. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<CurrencyOut[]>([]);
  const [currencyCode, setCurrencyCodeState] = useState<string>("USD");

  useEffect(() => {
    apiClient
      .get<CurrencyOut[]>("/api/v1/currencies")
      .then((response) => setCurrencies(response.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const savedOverride = localStorage.getItem(STORAGE_KEY);
    if (savedOverride) {
      setCurrencyCodeState(savedOverride);
      return;
    }
    if (currencies.length === 0) return;

    detectVisitorCountryCode().then((countryCode) => {
      setCurrencyCodeState(detectCurrencyForCountry(countryCode ?? undefined, currencies));
    });
  }, [currencies]);

  const setCurrencyCode = (code: string) => {
    setCurrencyCodeState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const formatUsd = (amountUsd: string | number): string => {
    const usdValue = Number(amountUsd);
    if (currencyCode === "USD") return `$${usdValue.toFixed(2)}`;

    const currency = currencies.find((c) => c.code === currencyCode);
    if (!currency) return `$${usdValue.toFixed(2)}`;

    const convertedValue = usdValue * Number(currency.rate_to_usd);
    return `${convertedValue.toFixed(2)} ${currency.code}`;
  };

  const availableCurrencyCodes = useMemo(
    () => ["USD", ...currencies.map((c) => c.code).filter((code) => code !== "USD")],
    [currencies],
  );

  const value: CurrencyContextValue = { currencyCode, setCurrencyCode, availableCurrencyCodes, formatUsd };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
