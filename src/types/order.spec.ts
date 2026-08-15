import { describe, expect, it } from "vitest";
import {
  orderSchema,
  orderItemSchema,
  orderWithItemsSchema,
  createOrderSchema,
  createOrderItemSchema,
} from "./order";
import type { CreateOrder, CreateOrderItem } from "./order";

// Compile-time only: proves the write TYPES reject the response-only fields,
// mirroring what the write SCHEMAS already strip at runtime (checked below).
// `pnpm typecheck` fails if a response-only field ever leaks back into
// CreateOrder/CreateOrderItem, because the corresponding ts-expect-error
// directive below would then be unused.
function assertCreateOrderRejectsResponseOnlyFields(order: CreateOrder) {
  // @ts-expect-error applied_promotions is response-only; CreateOrder must not carry it
  void order.applied_promotions;
  // @ts-expect-error shipping_method_name is response-only; CreateOrder must not carry it
  void order.shipping_method_name;
  // @ts-expect-error shipping_city_name is response-only; CreateOrder must not carry it
  void order.shipping_city_name;
  // @ts-expect-error shipping_ward_name is response-only; CreateOrder must not carry it
  void order.shipping_ward_name;
}
void assertCreateOrderRejectsResponseOnlyFields;

function assertCreateOrderItemRejectsResponseOnlyFields(
  item: CreateOrderItem,
) {
  // @ts-expect-error discount is response-only; CreateOrderItem must not carry it
  void item.discount;
  // @ts-expect-error applied_promotions is response-only; CreateOrderItem must not carry it
  void item.applied_promotions;
}
void assertCreateOrderItemRejectsResponseOnlyFields;

function baseOrderItemFixture() {
  return {
    id: 1,
    order_id: 10,
    product_id: 20,
    product_name: "Widget",
    product_image: null,
    quantity: 2,
    price: 15,
    original_price: 20,
    total: 30,
    discount: 5,
    applied_promotions: [
      {
        promotion_id: 7,
        promotion_name: null,
        discount_amount: 5,
        shipping_discount: null,
      },
    ],
    variant_id: null,
    variant_name: null,
    created_at: null,
  };
}

function baseOrderFixture() {
  return {
    id: 100,
    user_id: null,
    customer_name: "Jane Doe",
    customer_email: "jane@example.com",
    customer_phone: "0123456789",
    customer_avatar: null,
    status: null,
    order_status: "pending",
    fulfillment_status: "unfulfilled",
    shipping_status: "not_shipped",
    payment_status: "pending",
    payment_method: "cod",
    subtotal: 30,
    original_subtotal: 40,
    shipping_fee: 0,
    original_shipping_fee: 5,
    shipping_discount: 5,
    tax: 0,
    discount: 5,
    total: 30,
    shipping_street: "123 Main St",
    shipping_city: "Ho Chi Minh City",
    shipping_district: null,
    shipping_ward: null,
    shipping_postal_code: null,
    tracking_number: null,
    notes: null,
    order_number: 1001,
    applied_promotions: [
      {
        promotion_id: 7,
        promotion_name: "Summer Sale",
        discount_amount: null,
        shipping_discount: 5,
      },
    ],
    shipping_method_name: "Standard Shipping",
    shipping_city_name: "Ho Chi Minh City",
    shipping_ward_name: "Ward 1",
  };
}

describe("order schemas preserve the Phase 1 response fields", () => {
  it("orderItemSchema preserves discount and applied_promotions", () => {
    const parsed = orderItemSchema.parse(baseOrderItemFixture());

    expect(parsed.discount).toBe(5);
    expect(parsed.applied_promotions).toHaveLength(1);
    expect(parsed.applied_promotions?.[0]).toMatchObject({
      promotion_id: 7,
      promotion_name: null,
      discount_amount: 5,
    });
  });

  it("orderSchema preserves applied_promotions (with a real promotion_name) and shipping_*_name fields", () => {
    const parsed = orderSchema.parse(baseOrderFixture());

    expect(parsed.applied_promotions).toHaveLength(1);
    expect(parsed.applied_promotions?.[0]).toMatchObject({
      promotion_id: 7,
      promotion_name: "Summer Sale",
      shipping_discount: 5,
    });
    expect(parsed.shipping_method_name).toBe("Standard Shipping");
    expect(parsed.shipping_city_name).toBe("Ho Chi Minh City");
    expect(parsed.shipping_ward_name).toBe("Ward 1");
  });

  it("orderWithItemsSchema preserves the new fields on both the order and its items", () => {
    const parsed = orderWithItemsSchema.parse({
      ...baseOrderFixture(),
      items: [baseOrderItemFixture()],
    });

    expect(parsed.applied_promotions?.[0].promotion_name).toBe("Summer Sale");
    expect(parsed.items?.[0].discount).toBe(5);
    expect(parsed.items?.[0].applied_promotions?.[0].promotion_id).toBe(7);
  });

  it("createOrderSchema strips response-only fields instead of accepting them as write input", () => {
    const { id, order_number, created_at, updated_at, ...writable } =
      baseOrderFixture() as any;
    const parsed = createOrderSchema.parse(writable);

    expect(parsed).not.toHaveProperty("applied_promotions");
    expect(parsed).not.toHaveProperty("shipping_method_name");
    expect(parsed).not.toHaveProperty("shipping_city_name");
    expect(parsed).not.toHaveProperty("shipping_ward_name");
  });

  it("createOrderItemSchema strips response-only fields instead of accepting them as write input", () => {
    const { id, created_at, ...writable } = baseOrderItemFixture() as any;
    const parsed = createOrderItemSchema.parse(writable);

    expect(parsed).not.toHaveProperty("discount");
    expect(parsed).not.toHaveProperty("applied_promotions");
  });

  it("CreateOrder/CreateOrderItem write types reject response-only fields (compile-time)", () => {
    // The real assertion here is `pnpm typecheck`: it fails if any of the
    // ts-expect-error directives inside assertCreateOrderRejectsResponseOnlyFields
    // / assertCreateOrderItemRejectsResponseOnlyFields become unused, which
    // happens exactly when a response-only field leaks back into the write
    // types. This runtime assertion just keeps the suite from reporting an
    // empty test for that intent.
    expect(true).toBe(true);
  });
});
