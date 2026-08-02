// File: frontend/src/components/ui/AirportAutocomplete.tsx

import { useEffect, useRef, useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { AIRPORTS, searchAirports } from "@/lib/airports";

interface AirportAutocompleteProps {
  label: string;
  value: string;
  onChange: (iataCode: string) => void;
  placeholder?: string;
}

/**
 * حقل بحث عن مطار بالاسم العربي أو الإنجليزي أو رمز IATA مباشرة، مع
 * قائمة اقتراحات منسدلة — بدل إدخال رمز المطار يدوياً فقط.
 */
export function AirportAutocomplete({ label, value, onChange, placeholder }: AirportAutocompleteProps) {
  const selected = AIRPORTS.find((airport) => airport.code === value);
  const [inputText, setInputText] = useState(selected ? `${selected.city_ar} (${selected.code})` : "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = AIRPORTS.find((airport) => airport.code === value);
    setInputText(current ? `${current.city_ar} (${current.code})` : "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = searchAirports(inputText);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
      <input
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value);
          setIsOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full ${inputBaseClass}`}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((airport) => (
            <li key={airport.code}>
              <button
                type="button"
                onClick={() => {
                  onChange(airport.code);
                  setInputText(`${airport.city_ar} (${airport.code})`);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-navy-50"
              >
                <span>
                  <span className="font-medium text-slate-800">{airport.city_ar}</span>
                  <span className="ms-1 text-slate-400">({airport.city_en})</span>
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-500">
                  {airport.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
