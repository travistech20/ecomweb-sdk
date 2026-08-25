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
  it("does not silently default a missing payment_method", () => {
    const parsed = createOrderSchema.safeParse({
      customer_name: "Nguyen Van A",
      customer_phone: "0900000000",
      items: [{ product_id: 1, quantity: 1 }],
    });

    if (parsed.success) {
      expect(parsed.data.payment_method).toBeUndefined();
    }
  });
});
