import type {
  Order,
  OrderItem,
  OrderWithItems,
  BaseQueryParams,
  OrderStatus,
  PaymentMethod,
} from "../../types";

export type { Order, OrderItem, OrderWithItems, PaymentMethod };

export interface CustomerOrderFilter extends BaseQueryParams {
  search?: string;
  status?: OrderStatus;
}

export interface CreateOrderItemRequest {
  product_id: number;
  product_name: string;
  product_image?: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  /** @deprecated Ignored — the API resolves the unit price from the catalog. */
  price?: number;
  /** @deprecated Ignored — the API resolves the unit price from the catalog. */
  original_price?: number;
  /** @deprecated Ignored — the API computes price x quantity. */
  total?: number;
}

export interface CreateOrderRequest {
  cart_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_avatar?: string;
  /** @deprecated Ignored — computed server-side from catalog prices. */
  subtotal?: number;
  /** @deprecated Ignored — computed server-side by the shipping rules engine. */
  shipping_fee?: number;
  /** @deprecated Ignored — computed server-side from active promotions. */
  discount?: number;
  /** @deprecated Ignored — computed server-side. */
  total?: number;
  shipping_street: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_ward?: string;
  shipping_postal_code?: string;
  /**
   * Shipping method chosen by the shopper. Its fee is computed server-side;
   * omit to let the server pick the best available option.
   */
  shipping_method_id?: number;
  payment_method: PaymentMethod;
  notes?: string;
  customer_address_id?: number;
  promotion_id?: number;
  items: CreateOrderItemRequest[];
}

export interface GuestOrderLookupParams {
  /**
   * What the shopper typed: an order code like "DH-1042-26" or "#1042" — the
   * only identifier they are ever shown. The API matches the code exactly and
   * falls back to the bare sequence, so either form works.
   */
  order_code?: string;
  /** @deprecated Prefer `order_code`, which is what customers actually see. */
  order_number?: number;
  customer_email?: string;
  customer_phone?: string;
}

export interface GuestOrderLookupResult {
  order: OrderWithItems | null;
  found: boolean;
  message?: string;
}
