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
 * `rule_set` is the current shape and takes precedence server-side. `filters`
 * is the legacy flat map, kept because collections are upgraded lazily — a
 * collection converts the first time a merchant saves it, so both shapes exist
 * in the wild indefinitely. `filter_by` is a raw pre-compiled filter string.
 *
 * The index signature is retained deliberately: the API accepts additional
 * search parameters here, and narrowing this would break existing readers.
 */
export interface CollectionSearchCriteria extends Record<string, unknown> {
  rule_set?: CollectionRuleSet;
  /** Legacy flat filter map. Implicitly AND-joined; carries no operator. */
  filters?: Record<string, unknown>;
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
