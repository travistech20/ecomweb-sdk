import { describe, expect, it } from "vitest";
import { searchCatalogParamsSchema, searchProductSchema } from "./types";

describe("catalog search params", () => {
  it("no longer declares category_id — the API stopped accepting it", () => {
    expect("category_id" in searchCatalogParamsSchema.shape).toBe(false);
  });

  it("still accepts the parameters the API does honour", () => {
    const parsed = searchCatalogParamsSchema.parse({
      collection: "products",
      q: "áo",
      min_price: 1000,
    });
    expect(parsed.collection).toBe("products");
  });
});

describe("search result shape", () => {
  it("KEEPS category_id and category_name — the API still returns them", () => {
    // Phase C's review reverted the projection drop; the tenant category
    // fields retire in Phase E, together with the categories table.
    expect("category_id" in searchProductSchema.shape).toBe(true);
    expect("category_name" in searchProductSchema.shape).toBe(true);
  });
});
