export interface ValidatePromotionCodeRequest {
  code: string;
  items: Array<{
    product_id: number;
    variant_id?: number;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping_fee: number;
}

export interface ValidatePromotionCodeResponse {
  success: boolean;
  message?: string;
  promotion?: {
    id: number;
    name: string;
    type: string;
    discount_method: string;
    discount_value: number;
    max_discount_amount?: number;
  };
  /**
   * Shipping discount this promotion yields against the `shipping_fee` sent in
   * the request, computed server-side. Display this rather than deriving it —
   * the server uses the same number when the order is placed.
   */
  shipping_discount?: number;
}

export interface PromotionSuggestion {
  id: number;
  name: string;
  code: string;
  description?: string;
  type: string;
  discount_method?: string;
  discount_value?: number;
  max_discount_amount?: number;
  min_amount?: number;
  min_quantity?: number;
}

export interface PromotionSuggestionsResponse {
  success: boolean;
  promotions: PromotionSuggestion[];
}
