import { describe, it, expect } from "vitest";
import {
  SHIPPING_DELIVERY_TYPES,
  type ShippingOption,
  type ShippingRate,
} from "./types";

describe("shipping vocabulary", () => {
  it("carries the five VN delivery types", () => {
    expect(SHIPPING_DELIVERY_TYPES).toEqual([
      "STANDARD",
      "EXPRESS",
      "SAME_DAY",
      "ECONOMY",
      "PICKUP",
    ]);
  });

  it("a shipping option names the rate that priced it", () => {
    const option: ShippingOption = {
      amount: 25000,
      currency: "VND",
      rate_id: 41,
      delivery_type: "STANDARD",
      display_name: "Giao tiêu chuẩn",
    };
    expect(option.rate_id).toBe(41);
    expect(option.delivery_type).toBe("STANDARD");
  });

  it("a free rate is a zero amount, not a rate_type", () => {
    const rate: ShippingRate = {
      id: 7,
      zone_id: 3,
      delivery_type: "STANDARD",
      display_name: "Giao tiêu chuẩn",
      rate_type: "FIXED",
      amount: 0,
      condition_type: "ORDER_VALUE",
      min_value: 500000,
      max_value: null,
      estimated_days_min: 2,
      estimated_days_max: 3,
      is_active: true,
      sort_order: 100,
    };
    expect(rate.amount).toBe(0);
    // @ts-expect-error FREE is not a rate_type
    const bad: ShippingRate["rate_type"] = "FREE";
    expect(bad).toBe("FREE");
  });
});
