import { describe, expect, it } from "vitest";

import {
  COLLECTION_RULE_MATRIX,
  RULE_FIELDS,
  allowedValuesFor,
  isRuleField,
  operatorsForField,
  valueKindFor,
} from "./rule-set";

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
