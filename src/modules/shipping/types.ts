export interface Province {
  id: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface Ward {
  id: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

export interface LocationData {
  provinces: Record<string, Province>;
  wards: Record<string, Ward>;
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
