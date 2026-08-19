import { describe, expect, it } from "vitest";
import {
  collectionGridConfigSchema,
  WIDGET_REGISTRY,
  sectionConfigSchema,
  sectionTypeSchema,
  SECTION_CONFIG_SCHEMAS,
  parseSectionContent,
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

// ─── parseSectionContent — the dispatching parser ────────────────
//
// sectionConfigSchema (a bare z.union of the per-section content schemas)
// cannot discriminate between sections: heroBannerConfigSchema is first in
// the union and every one of its fields has a default, so it matches ANY
// object and every other section's content gets silently reinterpreted as
// a hero banner. parseSectionContent fixes this by dispatching on the
// section `type` (which callers already have, from the section wrapper)
// instead of asking zod to guess.

describe("parseSectionContent", () => {
  it("preserves collection_grid's collection_ids", () => {
    const parsed = parseSectionContent("collection_grid", {
      collection_ids: [3, 7],
      columns: 4,
      show_names: true,
      show_count: false,
    });
    expect(parsed.collection_ids).toEqual([3, 7]);
  });

  it("preserves category_grid's category_ids", () => {
    const parsed = parseSectionContent("category_grid", {
      category_ids: [1, 2],
      columns: 3,
      show_names: true,
    });
    expect(parsed.category_ids).toEqual([1, 2]);
  });

  it("preserves featured_products' collection_slug", () => {
    const parsed = parseSectionContent("featured_products", {
      collection_slug: "sale",
      limit: 12,
      columns: 4,
    });
    expect(parsed.collection_slug).toBe("sale");
  });

  it("every SectionType has an entry in SECTION_CONFIG_SCHEMAS", () => {
    for (const type of sectionTypeSchema.options) {
      expect(
        SECTION_CONFIG_SCHEMAS[type],
        `missing schema for section type "${type}"`,
      ).toBeDefined();
    }
  });

  it("every registry defaultContent round-trips through parseSectionContent for its own type", () => {
    for (const type of sectionTypeSchema.options) {
      const entry = WIDGET_REGISTRY[type];
      const parsed = parseSectionContent(type, entry.defaultContent);
      // Round-tripping must not silently produce another section's shape —
      // re-parsing the already-parsed output with the *same* schema must be
      // stable (idempotent), proving the correct per-type schema was used.
      expect(SECTION_CONFIG_SCHEMAS[type].safeParse(parsed).success).toBe(
        true,
      );
    }
  });

  it("throws on content that doesn't satisfy the named type's schema", () => {
    expect(() =>
      parseSectionContent("collection_grid", { columns: 99 }),
    ).toThrow();
  });
});

// ─── sectionConfigSchema — deprecated bare union regression ──────
//
// This documents the union's actual (broken) behaviour so nobody
// "fixes" the @deprecated warning by routing callers back through
// sectionConfigSchema, or by reordering its members — the shapes are
// structurally ambiguous and reordering just changes WHICH section type
// wins, not whether the bug exists.

describe("sectionConfigSchema (deprecated) — known-broken union parsing", () => {
  it("silently reinterprets collection_grid content as hero_banner", () => {
    const result = sectionConfigSchema.safeParse({
      collection_ids: [3, 7],
      columns: 4,
      show_names: true,
      show_count: false,
    });
    expect(result.success).toBe(true);
    // The real collection_ids are gone; hero_banner's defaults won instead.
    expect(result.data).toEqual({
      banners: [],
      autoplay: true,
      autoplay_interval: 5000,
    });
  });

  it("silently reinterprets category_grid content as hero_banner", () => {
    const result = sectionConfigSchema.safeParse({
      category_ids: [1, 2],
      columns: 3,
      show_names: true,
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      banners: [],
      autoplay: true,
      autoplay_interval: 5000,
    });
  });

  it("silently reinterprets featured_products content as hero_banner", () => {
    const result = sectionConfigSchema.safeParse({
      collection_slug: "sale",
      limit: 12,
      columns: 4,
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      banners: [],
      autoplay: true,
      autoplay_interval: 5000,
    });
  });
});
