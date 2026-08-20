import type { BaseQueryParams } from "../../types";

export interface SeoMetadata {
  meta_title: string | null;
  meta_description: string | null;
}

export interface WithSeoMetadata {
  seo_metadata?: SeoMetadata | null;
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
  search_criteria: Record<string, unknown> | unknown[] | null;
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
