// File: frontend/src/features/public/PublicFlightSearch.tsx

import { ArrowLeftRight, Plane, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AirportAutocomplete } from "@/components/ui/AirportAutocomplete";
import { useCurrency } from "@/features/public/useCurrency";
import { usePublicFlightSearch } from "@/features/public/usePublicFlightSearch";
import { glassPanelClass, inputBaseClass } from "@/lib/designTokens";

type TripType = "one_way" | "round_trip";

function stopsLabel(stops: number): string {
  if (stops === 0) return "مباشرة";
  if (stops === 1) return "توقف واحد";
  return `${stops} توقفات`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}س ${m}د`;
}

/** نموذج بحث رحلات طيران تفاعلي للصفحة الرئيسية العامة. */
export function PublicFlightSearch() {
  const { offers, search, isSearching, error } = usePublicFlightSearch();
  const { formatUsd } = useCurrency();
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const canSearch = origin.trim().length === 3 && destination.trim().length === 3 && departureDate;

  const handleSearch = () => {
    search({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departure_date: departureDate,
      return_date: tripType === "round_trip" && returnDate ? returnDate : undefined,
      adults,
      children,
      infants,
    });
  };

  const swapCities = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div className="space-y-4">
      <div className={`${glassPanelClass} p-4 sm:p-5`}>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          <Plane size={20} className="ms-1 inline text-navy-600" />
          ابحث عن رحلتك
        </h2>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTripType("one_way")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
              tripType === "one_way" ? "bg-navy-600 text-white" : "border border-slate-200 bg-white/70 text-slate-600"
            }`}
          >
            ذهاب فقط
          </button>
          <button
            type="button"
            onClick={() => setTripType("round_trip")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
              tripType === "round_trip" ? "bg-navy-600 text-white" : "border border-slate-200 bg-white/70 text-slate-600"
            }`}
          >
            ذهاب وعودة
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <AirportAutocomplete label="مدينة الإقلاع" value={origin} onChange={setOrigin} placeholder="اكتب اسم المدينة أو المطار..." />
            <button
              type="button"
              onClick={swapCities}
              className="absolute start-1/2 top-1/2 z-10 hidden -translate-x-1/2 translate-y-1 rounded-full
                border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm hover:text-navy-600 sm:block"
              title="عكس الاتجاه"
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
          <div>
            <AirportAutocomplete label="مدينة الوصول" value={destination} onChange={setDestination} placeholder="اكتب اسم المدينة أو المطار..." />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">تاريخ الذهاب</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className={`w-full ${inputBaseClass}`} />
          </div>
          {tripType === "round_trip" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">تاريخ العودة</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">بالغين</label>
            <input type="number" min={1} max={9} value={adults} onChange={(e) => setAdults(Number(e.target.value) || 1)} className={`w-full ${inputBaseClass}`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">أطفال (2-11 سنة)</label>
            <input type="number" min={0} max={9} value={children} onChange={(e) => setChildren(Number(e.target.value) || 0)} className={`w-full ${inputBaseClass}`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">رضّع (أقل من سنتين)</label>
            <input type="number" min={0} max={9} value={infants} onChange={(e) => setInfants(Number(e.target.value) || 0)} className={`w-full ${inputBaseClass}`} />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={!canSearch || isSearching}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5
                text-sm font-semibold text-white shadow-sm transition-all duration-300
                hover:scale-[1.02] hover:bg-navy-500 active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={16} />
              {isSearching ? "جارٍ البحث..." : "ابحث الآن"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm text-rose-700">{error}</p>
      )}

      {offers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">{offers.length} رحلة متاحة</p>
          {offers.map((offer, index) => (
            <div key={index} className={`${glassPanelClass} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <Plane size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{offer.airline_name}</p>
                  <p className="text-xs text-slate-500">
                    {offer.origin} → {offer.destination} · {stopsLabel(offer.stops)} · {formatDuration(offer.duration_minutes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="text-lg font-bold text-navy-700">{formatUsd(offer.total_price_usd)}</p>
                  {Number(offer.fee_amount_usd) > 0 && (
                    <p className="text-xs text-slate-400">شامل رسوم الحجز</p>
                  )}
                </div>
                <Link
                  to="/register"
                  className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white
                    transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500"
                >
                  احجز الآن
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
