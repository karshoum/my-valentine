// File: frontend/src/features/flights/SelectedFlightCard.tsx

import { Anchor, Plane, X } from "lucide-react";

import { getAirlineDisplayName } from "@/lib/airlineNames";
import type { FlightOfferOut } from "@/types/flightBooking";

interface SelectedFlightCardProps {
  offer: FlightOfferOut;
  /** غير مُمرَّر لحجوزات البواخر: الخط يُختار من الصفحة العامة، فلا يوجد بحث بديل داخل النموذج. */
  onChangeFlight?: () => void;
}

/** بطاقة موجزة تعرض الرحلة/الحجز المختار من نتائج البحث، مع زر لتغييره قبل تأكيد الطلب (إن كان ممكناً). */
export function SelectedFlightCard({ offer, onChangeFlight }: SelectedFlightCardProps) {
  const isShip = offer.airline_code === "SHIP";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-200/80 bg-navy-50/60 p-3 text-xs">
      <div className="flex items-center gap-2 text-navy-800">
        {isShip ? <Anchor size={15} /> : <Plane size={15} />}
        <div>
          <p className="font-semibold">{getAirlineDisplayName(offer.airline_code, offer.airline_name)}</p>
          <p>
            {offer.origin} → {offer.destination} · ${offer.total_price_usd}
          </p>
        </div>
      </div>
      {onChangeFlight && (
        <button
          type="button"
          onClick={onChangeFlight}
          className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-navy-700 hover:bg-navy-100"
        >
          <X size={13} />
          تغيير الرحلة
        </button>
      )}
    </div>
  );
}
