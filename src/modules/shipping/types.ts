/**
 * One administrative area, at any depth, for any country. Replaces the
 * old Province/Ward pair: they differed only by which fields were
 * populated, and `level` now carries that distinction (for Vietnam,
 * 1 = province, 2 = ward).
 *
 * The old `id` was the source JSON object's own key, never a stable
 * identifier. Areas are addressed by `code`.
 */
export interface LocationArea {
  level: number;
  code: string;
  parent_code: string | null;
  name: string;
  name_with_type: string;
  type: string;
  slug: string;
  /** Null for a top-level area: a province has no path through parents. */
  path: string | null;
  path_with_type: string | null;
}

export const LEVEL_PROVINCE = 1;
export const LEVEL_WARD = 2;

export interface LocationAreaQuery {
  /** 1 = province, 2 = ward. */
  level?: number;
  /** Return this area's children, e.g. "11" for Ha Noi's wards. */
  parent_code?: string;
}

export interface LocationAreasResponse {
  country_code: string;
  areas: LocationArea[];
}

export interface ShippingCalculationRequest {
  province_id?: string;
  ward_id?: string;
  province?: string;
  district?: string;
  postal_code?: string;
  subtotal: number;
  currency: string;
  weight_gr: number;
  method?: "standard" | "express" | "pickup" | "cod";
  distance_km?: number;
  tags?: string[];
}

export const SHIPPING_DELIVERY_TYPES = [
  "STANDARD",
  "EXPRESS",
  "SAME_DAY",
  "ECONOMY",
  "PICKUP",
] as const;
export type ShippingDeliveryType = (typeof SHIPPING_DELIVERY_TYPES)[number];

/** FREE is deliberately absent: a free rate is amount 0. */
export const SHIPPING_RATE_TYPES = ["FIXED", "CARRIER_QUOTE"] as const;
export type ShippingRateType = (typeof SHIPPING_RATE_TYPES)[number];

export const SHIPPING_CONDITION_TYPES = [
  "NONE",
  "ORDER_VALUE",
  "WEIGHT",
] as const;
export type ShippingConditionType = (typeof SHIPPING_CONDITION_TYPES)[number];

export interface ShippingZone {
  id: number;
  code: string;
  name: string;
  provinces: string[];
  wards: string[];
  is_catch_all: boolean;
}

export interface ShippingRate {
  id: number;
  zone_id: number;
  delivery_type: ShippingDeliveryType;
  display_name: string;
  rate_type: ShippingRateType;
  amount: number;
  condition_type: ShippingConditionType;
  min_value: number | null;
  max_value: number | null;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ShippingOption {
  amount: number;
  currency: string;
  rate_id: number;
  delivery_type: ShippingDeliveryType;
  display_name: string;
  estimated_days_min?: number | null;
  estimated_days_max?: number | null;
  /** Populated only when the caller asks for debug output. */
  zone_id?: number;
  zone_name?: string;
  shadowed_zones?: Array<{ id: number; name: string; rank: number }>;
}
