import { z } from "zod";
import {
  optionalTimestampSchema,
  orderStatusSchema,
  fulfillmentStatusSchema,
  shippingStatusSchema,
  paymentStatusSchema,
  paymentMethodSchema,
  emailSchema,
  phoneSchema,
  moneySchema,
  uuidSchema,
  idSchema,
  OptionalTimestamp,
  Id,
  OrderStatus,
  FulfillmentStatus,
  ShippingStatus,
  PaymentStatus,
  LegacyOrderStatus,
  PaymentMethod,
} from "./common";

/**
 * Order-related schemas based on Prisma models
 */

/**
 * A promotion applied to an order or one of its items.
 *
 * `promotion_name` is resolved server-side from the promotions module and is
 * null when that lookup fails or the promotion was deleted — render the
 * amount without a name in that case, never a blank label.
 */
export interface AppliedPromotion {
  promotion_id: number;
  promotion_name?: string | null;
  /** Item-level rows carry a real amount; order-level rows are always null. */
  discount_amount?: number | null;
  shipping_discount?: number | null;
}

// Order interface
export interface Order extends OptionalTimestamp {
  id: Id;
  user_id: string | null; // UUID
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_avatar: string | null;
  // DEPRECATED: Legacy status field for backward compatibility
  status?: LegacyOrderStatus | string | null;
  // NEW: Separate status fields managed by state machines
  order_status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  shipping_status: ShippingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  original_subtotal: number | null;
  shipping_fee: number;
  original_shipping_fee: number | null;
  shipping_discount: number | null;
  tax: number;
  discount: number;
  total: number;
  shipping_street: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_ward: string | null;
  shipping_postal_code: string | null;
  tracking_number: string | null;
  notes: string | null;
  order_number: Id;
  items?: OrderItem[];
  applied_promotions?: AppliedPromotion[];
  /** Snapshot from order_shippings; present when the API includes shipping. */
  shipping_method_name?: string | null;
  /** Display names resolved server-side from the shippings module. */
  shipping_city_name?: string | null;
  shipping_ward_name?: string | null;
}

// Order item interface
export interface OrderItem {
  id: Id;
  order_id: Id | null;
  product_id: Id | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  original_price: number | null; // Original price before promotions/discounts
  total: number;
  /** Total discount applied to this line. */
  discount?: number | null;
  applied_promotions?: AppliedPromotion[];
  variant_id: Id | null;
  variant_name: string | null;
  created_at: string | null; // ISO datetime string
}

// Order with items interface
export interface OrderWithItems extends Order {
  items?: OrderItem[];
}

// Customer order summary interface
export interface CustomerOrderSummary {
  customer_email: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null; // ISO datetime string
}

/**
 * Money fields the API always recomputes from the catalog, the promotion
 * engine and the shipping rules. They are accepted for backwards
 * compatibility but ignored — never rely on a value sent here.
 */
export type ServerComputedOrderAmounts =
  | "subtotal"
  | "original_subtotal"
  | "shipping_fee"
  | "original_shipping_fee"
  | "shipping_discount"
  | "discount"
  | "total";

// Create order input type
// Note: applied_promotions/shipping_*_name are response-only (computed/joined
// server-side) and must never be accepted as write input — mirrors the
// createOrderSchema/updateOrderSchema .omit() lists below.
export type CreateOrder = Omit<
  Order,
  | "id"
  | "order_number"
  | keyof OptionalTimestamp
  | "applied_promotions"
  | "shipping_method_name"
  | "shipping_city_name"
  | "shipping_ward_name"
  // Server-owned: 0 until store-level tax settings exist. Never write input.
  | "tax"
  | ServerComputedOrderAmounts
> &
  Partial<Pick<Order, ServerComputedOrderAmounts>> & {
    /**
     * Which shipping method the shopper picked. Write-only: the API prices it
     * from the store's shipping rules and rejects a method with no available
     * rate for the address. Omit to let the server choose the best option.
     */
    shipping_method_id?: Id | null;
  };

// Update order input type
export type UpdateOrder = Partial<CreateOrder>;

// Create order item input type
// Note: discount/applied_promotions are response-only (computed server-side)
// and must never be accepted as write input — mirrors createOrderItemSchema.
// price/total are accepted but ignored: the API resolves the unit price from
// the catalog so a client cannot choose what it pays.
export type CreateOrderItem = Omit<
  OrderItem,
  | "id"
  | "created_at"
  | "discount"
  | "applied_promotions"
  | "price"
  | "total"
> &
  Partial<Pick<OrderItem, "price" | "total">>;

// Update order item input type
export type UpdateOrderItem = Partial<Omit<CreateOrderItem, "order_id">>;

// A promotion applied to an order or one of its items
export const appliedPromotionSchema = z.object({
  promotion_id: idSchema,
  promotion_name: z.string().optional().nullable(),
  discount_amount: moneySchema.optional().nullable(),
  shipping_discount: moneySchema.optional().nullable(),
}) as unknown as z.ZodType<AppliedPromotion>;

// Order item
export const orderItemSchema = z.object({
  id: idSchema,
  order_id: idSchema.optional().nullable(),
  product_id: idSchema.optional().nullable(),
  product_name: z.string().min(1),
  product_image: z.string().optional().nullable(),
  quantity: z.int32().min(1).default(1),
  price: moneySchema,
  original_price: moneySchema.optional().nullable(),
  total: moneySchema,
  discount: moneySchema.optional().nullable(),
  applied_promotions: z.array(appliedPromotionSchema).optional(),
  variant_id: idSchema.optional().nullable(),
  variant_name: z.string().optional().nullable(),
  created_at: z.iso.datetime().optional().nullable(),
});

// Order main entity
export const orderSchema = z
  .object({
    id: idSchema,
    user_id: uuidSchema.optional().nullable(),
    customer_name: z.string().min(1),
    customer_email: emailSchema,
    customer_phone: phoneSchema,
    customer_avatar: z.string().optional().nullable(),
    // DEPRECATED: Legacy status field for backward compatibility
    status: z.string().optional().nullable(),
    // NEW: Separate status fields managed by state machines
    order_status: orderStatusSchema,
    fulfillment_status: fulfillmentStatusSchema,
    shipping_status: shippingStatusSchema,
    payment_status: paymentStatusSchema,
    payment_method: paymentMethodSchema.default("cod"),
    subtotal: moneySchema.default(0),
    original_subtotal: moneySchema.default(0),
    shipping_fee: moneySchema.default(0),
    original_shipping_fee: moneySchema.default(0),
    shipping_discount: moneySchema.default(0),
    tax: moneySchema.default(0),
    discount: moneySchema.default(0),
    total: moneySchema.default(0),
    shipping_street: z.string().min(1),
    shipping_city: z.string().min(1),
    shipping_district: z.string().optional().nullable(),
    shipping_ward: z.string().optional().nullable(),
    shipping_postal_code: z.string().optional().nullable(),
    tracking_number: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    order_number: idSchema,
    items: z.array(orderItemSchema).optional(),
    applied_promotions: z.array(appliedPromotionSchema).optional(),
    shipping_method_name: z.string().optional().nullable(),
    shipping_city_name: z.string().optional().nullable(),
    shipping_ward_name: z.string().optional().nullable(),
  })
  .extend(optionalTimestampSchema.shape);

// Create order schema
// Note: applied_promotions/shipping_*_name are response-only (computed/joined
// server-side) and must never be accepted as write input.
export const createOrderSchema = orderSchema
  .omit({
    id: true,
    order_number: true,
    created_at: true,
    updated_at: true,
    applied_promotions: true,
    shipping_method_name: true,
    shipping_city_name: true,
    shipping_ward_name: true,
    tax: true,
  })
  .extend({
    // Write-only: not part of the order response.
    shipping_method_id: idSchema.optional().nullable(),
  }) as unknown as z.ZodType<CreateOrder>;

// Update order schema
export const updateOrderSchema = orderSchema
  .omit({
    id: true,
    order_number: true,
    created_at: true,
    updated_at: true,
    applied_promotions: true,
    shipping_method_name: true,
    shipping_city_name: true,
    shipping_ward_name: true,
  })
  .partial() as unknown as z.ZodType<UpdateOrder>;

// Create order item schema
// Note: discount/applied_promotions are response-only (computed server-side)
// and must never be accepted as write input.
export const createOrderItemSchema = orderItemSchema
  .omit({
    id: true,
    created_at: true,
    discount: true,
    applied_promotions: true,
  })
  .partial({
    price: true,
    total: true,
  }) as unknown as z.ZodType<CreateOrderItem>;

// Update order item schema
export const updateOrderItemSchema = orderItemSchema
  .omit({
    id: true,
    created_at: true,
    discount: true,
    applied_promotions: true,
  })
  .partial()
  .omit({
    order_id: true,
  }) as unknown as z.ZodType<UpdateOrderItem>;

// Order with items schema
export const orderWithItemsSchema = orderSchema.extend({
  items: z.array(orderItemSchema).optional(),
}) as unknown as z.ZodType<OrderWithItems>;

// Customer order summary schema
export const customerOrderSummarySchema = z.object({
  customer_email: emailSchema,
  customer_name: z.string(),
  total_orders: z.int32(),
  total_spent: moneySchema,
  last_order_date: z.iso.datetime().optional().nullable(),
}) as unknown as z.ZodType<CustomerOrderSummary>;
