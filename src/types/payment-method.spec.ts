import { describe, it, expect } from "vitest";
import { paymentMethodSchema, KNOWN_PAYMENT_METHODS } from "./common";
import { createOrderSchema } from "./order";

describe("paymentMethodSchema", () => {
  it("accepts a store-defined method the SDK has never heard of", () => {
    expect(paymentMethodSchema.parse("onepay")).toBe("onepay");
    expect(paymentMethodSchema.parse("some_new_wallet")).toBe("some_new_wallet");
  });

  it("still accepts the historical methods", () => {
    for (const method of ["cod", "bank_transfer", "momo", "zalopay", "vnpay"]) {
      expect(paymentMethodSchema.parse(method)).toBe(method);
    }
  });

  it("rejects an empty string", () => {
    expect(() => paymentMethodSchema.parse("")).toThrow();
  });

  it("rejects a non-string", () => {
    expect(() => paymentMethodSchema.parse(42)).toThrow();
  });

  it("publishes the known methods for UI labelling without constraining input", () => {
    expect(KNOWN_PAYMENT_METHODS).toContain("cod");
    expect(KNOWN_PAYMENT_METHODS).toContain("bank_transfer");
  });
});

describe("createOrderSchema payment_method", () => {
  it("does not invent a payment method when one is absent", () => {
    // Build a complete valid payload with all required fields, except payment_method.
    // The old schema carried .default("cod") on payment_method, so this would have
    // returned "cod" for an order that never specified a method. A missing method must
    // now reach the API as missing — only the API knows which methods a given store
    // has enabled.
    const payload = {
      customer_name: "Jane Doe",
      customer_email: "jane@example.com",
      customer_phone: "0123456789",
      customer_avatar: null,
      order_status: "pending",
      fulfillment_status: "unfulfilled",
      shipping_status: "not_shipped",
      payment_status: "pending",
      // payment_method intentionally absent
      subtotal: 30,
      original_subtotal: 40,
      shipping_fee: 0,
      original_shipping_fee: 5,
      shipping_discount: 5,
      discount: 5,
      total: 30,
      shipping_street: "123 Main St",
      shipping_city: "Ho Chi Minh City",
      shipping_district: null,
      shipping_ward: null,
      shipping_postal_code: null,
      tracking_number: null,
      notes: null,
      items: [],
    };

    const parsed = createOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.payment_method).toBeUndefined();
    }
  });

  it("accepts a store-defined method on the write path", () => {
    const payload = {
      customer_name: "Jane Doe",
      customer_email: "jane@example.com",
      customer_phone: "0123456789",
      customer_avatar: null,
      order_status: "pending",
      fulfillment_status: "unfulfilled",
      shipping_status: "not_shipped",
      payment_status: "pending",
      payment_method: "onepay",
      subtotal: 30,
      original_subtotal: 40,
      shipping_fee: 0,
      original_shipping_fee: 5,
      shipping_discount: 5,
      discount: 5,
      total: 30,
      shipping_street: "123 Main St",
      shipping_city: "Ho Chi Minh City",
      shipping_district: null,
      shipping_ward: null,
      shipping_postal_code: null,
      tracking_number: null,
      notes: null,
      items: [],
    };

    const parsed = createOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.payment_method).toBe("onepay");
    }
  });
});
