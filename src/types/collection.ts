import { z } from "zod";
import {
  optionalTimestampSchema,
  deletedAtSchema,
  idSchema,
  slugSchema,
  urlSchema,
  OptionalTimestamp,
  DeletedAt,
} from "./common";
import {
  baseQueryParamsSchema,
  baseDeleteOptionsSchema,
  baseDeleteResultSchema,
  paginatedResponseSchema,
} from "./pagination";

/**
 * Collection enums
 */
export const collectionTypeSchema = z.enum(["manual", "smart"]);
export type CollectionType = z.infer<typeof collectionTypeSchema>;

export const collectionStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
  "unlisted",
]);
export type CollectionStatus = z.infer<typeof collectionStatusSchema>;

export const collectionSortSchema = z.enum([
  "manual",
  "product_name_asc",
  "product_name_desc",
  "best_selling",
  "highest_price",
  "lowest_price",
  "newest",
  "oldest",
]);
export type CollectionSort = z.infer<typeof collectionSortSchema>;

export type CollectionSearchCriteria =
  | Record<string, unknown>
  | unknown[]
  | null;

/**
 * Collection entity interface
 */
export interface Collection extends OptionalTimestamp, DeletedAt {
  id: number;
  name: string;
  description?: string | null;
  type: CollectionType;
  image_url?: string | null;
  slug: string;
  status: CollectionStatus;
  search_criteria?: CollectionSearchCriteria; // Only for smart collections
  collection_sort: CollectionSort; // How products should be sorted within this collection
  product_ids?: number[]; // Only for manual collections - stored in collection_products table
  product_count?: number; // Number of products in collection (optional, only included if requested)
}

export type CreateCollection = Omit<
  Collection,
  "id" | keyof OptionalTimestamp | keyof DeletedAt
>;

export type UpdateCollection = Partial<CreateCollection>;

/**
 * Core collection schema definitions
 */
export const collectionSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    type: collectionTypeSchema,
    image_url: urlSchema,
    slug: slugSchema,
    status: collectionStatusSchema,
    search_criteria: z
      .record(z.string(), z.any())
      .or(z.array(z.any()))
      .optional()
      .nullable(),
    collection_sort: collectionSortSchema.default("manual"),
    product_ids: z.array(z.number()).optional(),
    product_count: z.number().optional(),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export const createCollectionSchema = collectionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const updateCollectionSchema = createCollectionSchema.partial();

/**
 * Query & pagination schemas
 */
export const collectionQueryParamsSchema = baseQueryParamsSchema.extend({
  type: collectionTypeSchema.optional(),
  status: collectionStatusSchema.optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  include_product_count: z.boolean().optional(),
});

export const collectionDeleteOptionsSchema = baseDeleteOptionsSchema;

export const collectionDeleteResultSchema = baseDeleteResultSchema.extend({
  collection_id: idSchema,
});

export const paginatedCollectionsSchema =
  paginatedResponseSchema(collectionSchema);

/**
 * Inferred helper types
 */
export type CollectionQueryParams = z.infer<typeof collectionQueryParamsSchema>;
export type CollectionDeleteOptions = z.infer<
  typeof collectionDeleteOptionsSchema
>;
export type CollectionDeleteResult = z.infer<
  typeof collectionDeleteResultSchema
>;
export type PaginatedCollectionsResponse = z.infer<
  typeof paginatedCollectionsSchema
>;
