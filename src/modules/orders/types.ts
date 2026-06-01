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
  price: number;
  total: number;
}

export interface CreateOrderRequest {
  cart_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_avatar?: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  shipping_street: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_ward?: string;
  shipping_postal_code?: string;
  payment_method: PaymentMethod;
  notes?: string;
  customer_address_id?: number;
  promotion_id?: number;
  items: CreateOrderItemRequest[];
}

export interface GuestOrderLookupParams {
  order_number: number;
  customer_email?: string;
  customer_phone?: string;
}

export interface GuestOrderLookupResult {
  order: OrderWithItems | null;
  found: boolean;
  message?: string;
}
