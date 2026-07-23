// File: frontend/src/features/flights/FlightSearchSection.tsx

import { Plane, Search } from "lucide-react";
import { useState } from "react";

import { useSearchFlights } from "@/features/flights/useSearchFlights";
import { inputBaseClass } from "@/lib/designTokens";
import type { FlightOfferOut } from "@/types/flightBooking";

interface FlightSearchSectionProps {
  onOfferSelected: (offer: FlightOfferOut) => void;
}

/** يصف عدد التوقفات بالعربية (مباشرة / توقف واحد / عدد التوقفات). */
function stopsLabel(stops: number): string {
  if (stops === 0) return "مباشرة";
  if (stops === 1) return "توقف واحد";
  return `${stops} توقفات`;
}

/** يحوّل عدد دقائق الرحلة إلى نص "Nس Mد" مقروء بالعربية. */
function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}س ${minutes}د`;
}

/**
 * قسم بحث الرحلات: نموذج (مدينة الانطلاق/الوصول/التواريخ/عدد
 * المسافرين) يعرض نتائج بحث حقيقية من مزوّد بيانات الطيران، مع سعر
 * نهائي شامل رسوم الحجز الحالية. اختيار رحلة يستدعي onOfferSelected.
 */
export function FlightSearchSection({ onOfferSelected }: FlightSearchSectionProps) {
  const { offers, search, isSearching, error } = useSearchFlights();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  const canSearch = origin.trim().length === 3 && destination.trim().length === 3 && departureDate;

  const handleSearch = () => {
    search({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departure_date: departureDate,
      return_date: returnDate || undefined,
      adults,
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
          placeholder="من (رمز المطار، مثال: DMM)"
          maxLength={3}
          className={`w-full uppercase ${inputBaseClass}`}
        />
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="إلى (رمز المطار، مثال: IST)"
          maxLength={3}
          className={`w-full uppercase ${inputBaseClass}`}
        />
        <input
          type="date"
          value={departureDate}
          onChange={(event) => setDepartureDate(event.target.value)}
          className={`w-full ${inputBaseClass}`}
        />
        <input
          type="date"
          value={returnDate}
          onChange={(event) => setReturnDate(event.target.value)}
          placeholder="تاريخ العودة (اختياري)"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          type="number"
          min={1}
          max={9}
          value={adults}
          onChange={(event) => setAdults(Number(event.target.value) || 1)}
          className={`w-full ${inputBaseClass}`}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch || isSearching}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm
            font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={15} />
          {isSearching ? "جارٍ البحث..." : "بحث"}
        </button>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {offers.length > 0 && (
        <div className="space-y-2">
          {offers.map((offer, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-xs"
            >
              <div className="flex items-center gap-2 text-slate-600">
                <Plane size={15} className="text-sky-600" />
                <div>
                  <p className="font-semibold text-slate-800">{offer.airline_name}</p>
                  <p>
                    {offer.origin} → {offer.destination} · {stopsLabel(offer.stops)} · {formatDuration(offer.duration_minutes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">${offer.total_price_usd}</span>
                <button
                  type="button"
                  onClick={() => onOfferSelected(offer)}
                  className="rounded-lg bg-navy-600 px-3 py-1.5 font-semibold text-white hover:bg-navy-700"
                >
                  اختيار
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
