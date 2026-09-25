import { describe, expect, it } from "vitest";
import {
  PAYMENT_TERMS,
  PURCHASE_ORDER_ERROR_CODES,
  PURCHASE_ORDER_STATUSES,
  paymentDueDays,
  type PurchaseOrderInput,
} from "./purchase-order";

describe("purchase order vocabulary", () => {
  it("lists the statuses in lifecycle order", () => {
    expect([...PURCHASE_ORDER_STATUSES]).toEqual([
      "draft",
      "ordered",
      "partially_received",
      "received",
      "closed",
      "cancelled",
    ]);
  });

  it("lists the payment terms", () => {
    expect([...PAYMENT_TERMS]).toEqual([
      "none",
      "cash_on_delivery",
      "due_on_receipt",
      "in_advance",
      "net_7",
      "net_15",
      "net_30",
      "net_45",
      "net_60",
    ]);
  });

  it("pins the error codes", () => {
    expect(PURCHASE_ORDER_ERROR_CODES).toEqual({
      SUPPLIER_NOT_FOUND: "SUPPLIER_NOT_FOUND",
      SUPPLIER_NAME_TAKEN: "SUPPLIER_NAME_TAKEN",
      SUPPLIER_ARCHIVED: "SUPPLIER_ARCHIVED",
      SUPPLIER_IN_USE: "SUPPLIER_IN_USE",
      NOT_FOUND: "PURCHASE_ORDER_NOT_FOUND",
      INVALID_TRANSITION: "PURCHASE_ORDER_INVALID_TRANSITION",
      INCOMPLETE: "PURCHASE_ORDER_INCOMPLETE",
      READ_ONLY: "PURCHASE_ORDER_READ_ONLY",
      DESTINATION_LOCKED: "PURCHASE_ORDER_DESTINATION_LOCKED",
      OVER_RECEIPT: "PURCHASE_ORDER_OVER_RECEIPT",
      QUANTITY_BELOW_SETTLED: "PURCHASE_ORDER_QUANTITY_BELOW_SETTLED",
      SUPPLIER_EMAIL_MISSING: "PURCHASE_ORDER_SUPPLIER_EMAIL_MISSING",
      LINE_VARIANT_MISSING: "PURCHASE_ORDER_LINE_VARIANT_MISSING",
    });
  });
});

describe("PurchaseOrderInput lines", () => {
  // Compile-time: an entry with `id` and no `variant_id` keeps that line's
  // variant and snapshot. It is the only way to edit a PO whose variant was
  // deleted, so `variant_id` must stay optional. `pnpm typecheck` fails here
  // if it becomes required again.
  it("accepts a keep entry, a new line, and a replacement", () => {
    const input: PurchaseOrderInput = {
      lines: [
        { id: 11, qty_ordered: 4, unit_cost: "12.5000" },
        { variant_id: 9, qty_ordered: 1, unit_cost: 3 },
        { id: 12, variant_id: 10, qty_ordered: 2, unit_cost: 5, tax_rate: "10.00" },
      ],
    };
    expect(input.lines?.map(line => line.variant_id)).toEqual([undefined, 9, 10]);
  });
});

describe("paymentDueDays", () => {
  it("returns the day count of a net term", () => {
    expect(paymentDueDays("net_7")).toBe(7);
    expect(paymentDueDays("net_60")).toBe(60);
  });

  it("returns null for terms without a due date", () => {
    for (const terms of ["none", "cash_on_delivery", "due_on_receipt", "in_advance"] as const) {
      expect(paymentDueDays(terms)).toBeNull();
    }
  });
});
