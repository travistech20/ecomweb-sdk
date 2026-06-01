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

export interface ShippingOption {
  amount: number;
  currency: string;
  method_id: number;
  method_code: string;
  method_name: string;
  method_description?: string | null;
  estimated_days?: number;
  program_id?: number;
  rule_id?: number;
  zone_code?: string;
  debug?: any;
}
