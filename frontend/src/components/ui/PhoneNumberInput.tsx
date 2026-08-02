// File: frontend/src/components/ui/PhoneNumberInput.tsx

import { useEffect, useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { COUNTRY_DIAL_CODES, DEFAULT_DIAL_CODE, findDialCodeByIsoCode } from "@/lib/countryDialCodes";
import { detectVisitorCountryCode } from "@/lib/detectVisitorCountry";

interface PhoneNumberInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
}

/** يفصل رقم مُخزَّن مسبقاً (مثال: "+966501234567") إلى رمز الدولة والرقم المحلي. */
function splitStoredNumber(value: string): { dialCode: string; localNumber: string } {
  const match = COUNTRY_DIAL_CODES.find((country) => value.startsWith(country.dialCode));
  if (match) return { dialCode: match.dialCode, localNumber: value.slice(match.dialCode.length) };
  return { dialCode: DEFAULT_DIAL_CODE, localNumber: value };
}

/**
 * حقل رقم هاتف مع قائمة اختيار رمز الدولة (مفتاح الاتصال الدولي)،
 * يحدّد الرمز الافتراضي تلقائياً حسب دولة الزائر (كشف عبر IP) عند أول
 * استخدام إن لم يكن هناك رقم مُدخَل مسبقاً.
 */
export function PhoneNumberInput({ value, onChange, placeholder }: PhoneNumberInputProps) {
  const initial = splitStoredNumber(value);
  const [dialCode, setDialCode] = useState(initial.dialCode);
  const [localNumber, setLocalNumber] = useState(initial.localNumber);

  useEffect(() => {
    if (value) return;
    detectVisitorCountryCode().then((countryCode) => {
      if (countryCode) setDialCode(findDialCodeByIsoCode(countryCode));
    });
    // يُنفَّذ مرة واحدة فقط عند تركيب الحقل بقيمة فارغة، لا يعتمد على value لاحقاً.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = (nextDialCode: string, nextLocalNumber: string) => {
    onChange(nextLocalNumber.trim() ? `${nextDialCode}${nextLocalNumber.trim()}` : "");
  };

  return (
    <div className="flex gap-2">
      <select
        value={dialCode}
        onChange={(event) => {
          setDialCode(event.target.value);
          emitChange(event.target.value, localNumber);
        }}
        className={`w-32 shrink-0 text-sm ${inputBaseClass}`}
      >
        {COUNTRY_DIAL_CODES.map((country) => (
          <option key={country.isoCode} value={country.dialCode}>
            {country.dialCode} {country.nameAr}
          </option>
        ))}
      </select>
      <input
        value={localNumber}
        onChange={(event) => {
          setLocalNumber(event.target.value);
          emitChange(dialCode, event.target.value);
        }}
        placeholder={placeholder}
        className={`w-full ${inputBaseClass}`}
      />
    </div>
  );
}
