import { describe, expect, it } from "vitest";
import {
  ADJUSTABLE_STATES,
  INVENTORY_ADJUSTMENT_REASONS,
  INVENTORY_ERROR_CODES,
  INVENTORY_POLICIES,
  INVENTORY_STATES,
  MERCHANT_ADJUSTMENT_REASONS,
  UNAVAILABLE_STATES,
  onHand,
  unavailable,
} from "./inventory";

// The API pins these same lists in
// src/modules/inventory/domain/constants/inventory-vocabulary.contract.spec.ts.
// Change both together.
describe("inventory vocabulary", () => {
  it("lists the states in display order", () => {
    expect([...INVENTORY_STATES]).toEqual([
      "available",
      "committed",
      "damaged",
      "quality_control",
      "safety_stock",
      "other",
      "incoming",
    ]);
  });

  it("groups the four unavailable states", () => {
    expect([...UNAVAILABLE_STATES]).toEqual([
      "damaged",
      "quality_control",
      "safety_stock",
      "other",
    ]);
  });

  it("lets a merchant edit available and the unavailable states only", () => {
    expect([...ADJUSTABLE_STATES]).toEqual(["available", ...UNAVAILABLE_STATES]);
  });

  it("lists the policies", () => {
    expect([...INVENTORY_POLICIES]).toEqual(["deny", "continue"]);
  });

  it("lists every adjustment reason the API records", () => {
    expect([...INVENTORY_ADJUSTMENT_REASONS]).toEqual([
      "correction",
      "count",
      "received",
      "return_restock",
      "damaged",
      "theft_or_loss",
      "promotion_or_donation",
      "initial_stock",
      "order_reserved",
      "order_fulfilled",
      "order_released",
      "order_restocked",
      "cancelled_not_restocked",
      "migration_backfill",
      "purchase_order_ordered",
      "purchase_order_edited",
      "purchase_order_cancelled",
      "purchase_order_closed",
    ]);
  });

  it("offers merchants the first seven reasons only", () => {
    expect([...MERCHANT_ADJUSTMENT_REASONS]).toEqual(
      INVENTORY_ADJUSTMENT_REASONS.slice(0, 7),
    );
  });

  it("pins the error codes", () => {
    expect(INVENTORY_ERROR_CODES).toEqual({
      INSUFFICIENT_INVENTORY: "INSUFFICIENT_INVENTORY",
      STATE_NEGATIVE: "INVENTORY_STATE_NEGATIVE",
      VARIANT_NOT_IN_STORE: "INVENTORY_VARIANT_NOT_IN_STORE",
      DUPLICATE_VARIANT: "INVENTORY_DUPLICATE_VARIANT",
      QUANTITY_STALE: "INVENTORY_QUANTITY_STALE",
      IMPORT_TOO_LARGE: "INVENTORY_IMPORT_TOO_LARGE",
      IMPORT_INVALID_FILE: "INVENTORY_IMPORT_INVALID_FILE",
    });
  });
});

describe("inventory helpers", () => {
  const level = {
    available: 5,
    committed: 2,
    damaged: 1,
    quality_control: 1,
    safety_stock: 1,
    other: 1,
  };

  it("computes on hand without incoming", () => {
    expect(onHand(level)).toBe(11);
    expect(onHand({ ...level, available: -3 })).toBe(3);
  });

  it("computes unavailable from the four held states", () => {
    expect(unavailable(level)).toBe(4);
    expect(
      unavailable({
        damaged: 2,
        quality_control: 3,
        safety_stock: 4,
        other: 5,
      }),
    ).toBe(14);
  });
});
