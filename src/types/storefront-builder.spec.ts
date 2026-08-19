import { describe, expect, it } from "vitest";
import {
  collectionGridConfigSchema,
  WIDGET_REGISTRY,
  sectionConfigSchema,
  sectionTypeSchema,
} from "./storefront-builder";

describe("collection_grid section", () => {
  it("is a valid section type", () => {
    expect(sectionTypeSchema.safeParse("collection_grid").success).toBe(true);
  });

  it("keeps category_grid valid — the storefront still renders it until Phase E", () => {
    expect(sectionTypeSchema.safeParse("category_grid").success).toBe(true);
  });

  it("defaults to an empty selection meaning 'show all'", () => {
    const parsed = collectionGridConfigSchema.parse({});
    expect(parsed.collection_ids).toEqual([]);
    expect(parsed.columns).toBe(4);
    expect(parsed.show_names).toBe(true);
    expect(parsed.show_count).toBe(false);
  });

  it("accepts a selection of collection ids", () => {
    const parsed = collectionGridConfigSchema.parse({ collection_ids: [3, 7] });
    expect(parsed.collection_ids).toEqual([3, 7]);
  });

  it("rejects a column count the grid cannot render", () => {
    expect(collectionGridConfigSchema.safeParse({ columns: 5 }).success).toBe(
      false,
    );
  });

  it("is registered with a default content shape the builder can seed", () => {
    const entry = WIDGET_REGISTRY.collection_grid;
    expect(entry).toBeDefined();
    expect(entry.type).toBe("collection_grid");
    expect(entry.category).toBe("commerce");
    // The registry's defaultContent must satisfy its own schema, or the
    // builder seeds a section that fails validation the moment it is saved.
    expect(
      collectionGridConfigSchema.safeParse(entry.defaultContent).success,
    ).toBe(true);
  });

  it("is a member of the section config union", () => {
    const result = sectionConfigSchema.safeParse({
      collection_ids: [1],
      columns: 4,
      show_names: true,
      show_count: false,
    });
    expect(result.success).toBe(true);
  });
});
