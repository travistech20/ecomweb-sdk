import { describe, expect, it } from "vitest";
import type { CreateProductVariant, ProductVariant } from "./product";

describe("CreateProductVariant input shape", () => {
  it("compiles and typechecks without track_inventory or inventory_policy", () => {
    // The API defaults these two (true, "deny"); a create payload must not be
    // forced to supply them. If a future change makes them required again on
    // CreateProductVariant, this literal stops typechecking and `pnpm
    // typecheck` fails.
    const payload: CreateProductVariant = {
      product_id: 1,
      seller_sku: null,
      external_id: null,
      price: 1000,
      inventory: 0,
      weight: null,
      dimensions: null,
      is_default: true,
      status: "active",
    };

    expect(payload.track_inventory).toBeUndefined();
    expect(payload.inventory_policy).toBeUndefined();
  });

  it("keeps track_inventory and inventory_policy required on ProductVariant, a response", () => {
    // A response really does always carry these two, so the read-side
    // guarantee must not be relaxed. If ProductVariant ever makes them
    // optional, this assignment stops erroring, the `@ts-expect-error`
    // directive below becomes unused, and `pnpm typecheck` fails.
    // @ts-expect-error track_inventory and inventory_policy are required on a response
    const invalid: ProductVariant = {
      id: 1,
      product_id: 1,
      sku_id: 1,
      seller_sku: null,
      external_id: null,
      price: 1000,
      inventory: 0,
      weight: null,
      dimensions: null,
      is_default: true,
      status: "active",
    };

    expect(invalid).toBeDefined();
  });
});
