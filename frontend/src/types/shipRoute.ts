// File: frontend/src/types/shipRoute.ts

/** مطابق لـ app.schemas.ship_route.ShipRouteOut. */
export interface ShipRouteOut {
  id: number;
  origin_city: string;
  destination_city: string;
  adult_price_usd: string;
  child_price_usd: string;
  infant_price_usd: string;
  is_active: boolean;
  created_at: string;
}
