export interface CartApiItem {
  id: string;
  cart_id: string;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_image?: string;
  price: number;
  original_price?: number;
  variant_name?: string;
  variant_options?: Array<{
    optionName: string;
    optionValue: string;
  }>;
  promotions?: Array<{
    id: number;
    name: string;
    description?: string;
    mode: string;
    code?: string;
    type: string;
    condition_type: string;
    discount_method?: string;
    discount_value?: number;
    fixed_price?: number;
    min_amount?: number;
    min_quantity?: number;
    start_at: string;
    end_at?: string;
  }>;
  best_promotion?: any;
}

export interface CartApiResponse {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  status: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  items: CartApiItem[];
  subtotal: number;
  original_subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  item_count: number;
}

export interface AddToCartRequest {
  product_id: number;
  variant_id?: number;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
