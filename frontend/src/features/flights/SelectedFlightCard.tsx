// File: frontend/src/features/flights/SelectedFlightCard.tsx

import { Plane, X } from "lucide-react";

import { getAirlineDisplayName } from "@/lib/airlineNames";
import type { FlightOfferOut } from "@/types/flightBooking";

interface SelectedFlightCardProps {
  offer: FlightOfferOut;
  onChangeFlight: () => void;
}

/** بطاقة موجزة تعرض الرحلة المختارة من نتائج البحث، مع زر لتغييرها قبل تأكيد الطلب. */
export function SelectedFlightCard({ offer, onChangeFlight }: SelectedFlightCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-200/80 bg-navy-50/60 p-3 text-xs">
      <div className="flex items-center gap-2 text-navy-800">
        <Plane size={15} />
        <div>
          <p className="font-semibold">{getAirlineDisplayName(offer.airline_code, offer.airline_name)}</p>
          <p>
            {offer.origin} → {offer.destination} · ${offer.total_price_usd}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeFlight}
        className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-navy-700 hover:bg-navy-100"
      >
        <X size={13} />
        تغيير الرحلة
      </button>
    </div>
  );
}
