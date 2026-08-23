import { describe, expect, it } from "vitest";

import {
  COLLECTION_RULE_MATRIX,
  RULE_FIELDS,
  allowedValuesFor,
  isRuleField,
  operatorsForField,
  valueKindFor,
} from "./rule-set";
import type { RuleField, RuleOperator } from "./rule-set";

describe("collection rule vocabulary", () => {
  it("lists every matrix field in RULE_FIELDS", () => {
    expect([...RULE_FIELDS].sort()).toEqual(
      Object.keys(COLLECTION_RULE_MATRIX).sort()
    );
  });

  it("does not leak index field names into the client contract", () => {
    // The API maps price across two index fields and inverts them. That is
    // server detail; a client must never see or depend on it.
    const serialised = JSON.stringify(COLLECTION_RULE_MATRIX);
    expect(serialised).not.toContain("typesense");
    expect(serialised).not.toContain("min_price");
    expect(serialised).not.toContain("tag_ids");
  });

  it("gives tag the three set operators in display order", () => {
    expect(operatorsForField("tag")).toEqual(["any_of", "all_of", "none_of"]);
  });

  it("offers no equals on price", () => {
    expect(operatorsForField("price")).not.toContain("equals");
    expect(valueKindFor("price", "equals")).toBeUndefined();
  });

  it("reports the value kind for a valid pair", () => {
    expect(valueKindFor("price", "between")).toBe("number_pair");
    expect(valueKindFor("tag", "any_of")).toBe("number_list");
    expect(valueKindFor("stock", "is_true")).toBe("none");
  });

  it("restricts status to the three known values", () => {
    expect(allowedValuesFor("status")).toEqual([
      "active",
      "draft",
      "archived",
    ]);
    expect(allowedValuesFor("tag")).toBeUndefined();
  });

  it("rejects unknown field names everywhere", () => {
    expect(isRuleField("vendor")).toBe(false);
    expect(operatorsForField("vendor")).toEqual([]);
    expect(valueKindFor("vendor", "equals")).toBeUndefined();
    expect(allowedValuesFor("vendor")).toBeUndefined();
  });

  it("declares a value kind for every operator of every field", () => {
    for (const field of RULE_FIELDS) {
      for (const op of operatorsForField(field)) {
        expect(valueKindFor(field, op)).toBeDefined();
      }
    }
  });
});

describe("phase 3 rule fields", () => {
  it("offers in_subtree on category", () => {
    expect(operatorsForField("category")).toContain("in_subtree");
  });

  it("declares the new fields in display order", () => {
    expect(RULE_FIELDS).toEqual([
      "title",
      "sku",
      "tag",
      "category",
      "attribute",
      "price",
      "rating",
      "stock",
      "promotion",
      "discount",
      "video",
      "sales",
      "sales_30d",
      "status",
    ]);
  });

  it("types attribute values as attr_token_list", () => {
    expect(valueKindFor("attribute", "any_of")).toBe("attr_token_list");
    expect(valueKindFor("attribute", "none_of")).toBe("attr_token_list");
  });

  it("types video as a valueless boolean field", () => {
    expect(valueKindFor("video", "is_true")).toBe("none");
  });

  it("types sales thresholds as numbers", () => {
    expect(valueKindFor("sales", "gte")).toBe("number");
    expect(valueKindFor("sales_30d", "lte")).toBe("number");
  });

  it("types title and sku as free text, equals only", () => {
    expect(valueKindFor("title", "equals")).toBe("text");
    expect(valueKindFor("sku", "equals")).toBe("text");
    expect(operatorsForField("title")).toEqual(["equals"]);
    expect(operatorsForField("sku")).toEqual(["equals"]);
  });

  it("does not offer a prefix operator on title or sku", () => {
    expect(valueKindFor("title", "starts_with")).toBeUndefined();
    expect(valueKindFor("sku", "starts_with")).toBeUndefined();
    expect(operatorsForField("title")).not.toContain("starts_with");
    expect(operatorsForField("sku")).not.toContain("starts_with");
  });

  it("types discount as a gte-only number threshold", () => {
    expect(valueKindFor("discount", "gte")).toBe("number");
    expect(operatorsForField("discount")).toEqual(["gte"]);
  });

  it("pins operator order for every field, which drives dropdown order and the API mirror", () => {
    const expected: Record<RuleField, RuleOperator[]> = {
      title: ["equals"],
      sku: ["equals"],
      tag: ["any_of", "all_of", "none_of"],
      category: ["equals", "not_equals", "any_of", "in_subtree"],
      attribute: ["any_of", "none_of"],
      price: ["gt", "gte", "lt", "lte", "between"],
      rating: ["gte", "lte"],
      stock: ["is_true", "is_false"],
      promotion: ["is_true", "is_false"],
      discount: ["gte"],
      video: ["is_true", "is_false"],
      sales: ["gte", "lte"],
      sales_30d: ["gte", "lte"],
      status: ["equals", "not_equals"],
    };
    for (const field of RULE_FIELDS) {
      expect(operatorsForField(field)).toEqual(expected[field]);
    }
  });
});
