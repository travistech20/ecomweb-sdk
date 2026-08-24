import type { BaseQueryParams } from "../../types";
import type { CollectionRuleSet } from "./rule-set";

export interface SeoMetadata {
  meta_title: string | null;
  meta_description: string | null;
}

export interface WithSeoMetadata {
  seo_metadata?: SeoMetadata | null;
}

/**
 * A smart collection's stored criteria.
 *
 * `rule_set` is the only structured shape. The legacy flat `filters` map it
 * replaced was backfilled into rule sets and removed server-side in #242 —
 * the API now rejects the key outright rather than ignoring it, so do not
 * reintroduce it here. `filter_by` is a raw pre-compiled filter string.
 *
 * An empty `rules` array is meaningful: it is how a collection says "every
 * product", and is what the retired `all_products` flag became.
 *
 * The index signature is retained deliberately: the API accepts additional
 * search parameters here, and narrowing this would break existing readers.
 */
export interface CollectionSearchCriteria extends Record<string, unknown> {
  rule_set?: CollectionRuleSet;
  /** Raw pre-compiled filter string, passed through untouched. */
  filter_by?: string;
  q?: string;
}

export interface Collection extends WithSeoMetadata {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  slug: string;
  type: "manual" | "automated";
  status: "active" | "inactive";
  image_url: string | null;
  search_criteria: CollectionSearchCriteria | unknown[] | string | null;
  collection_sort: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionQueryParams extends BaseQueryParams {
  /** Fetch a specific set of collections — how collection_grid resolves its configured collection_ids. */
  ids?: number[];
  type?: Collection["type"];
  status?: Collection["status"];
  slug?: string;
  name?: string;
  include_product_count?: boolean;
}
