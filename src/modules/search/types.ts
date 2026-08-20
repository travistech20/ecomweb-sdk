import { z } from "zod";

export const searchCatalogParamsSchema = z.object({
  q: z.string().optional(),
  collection: z.string(),
  status: z.string().optional(),
  variant_mode: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  page: z.number().int().optional(),
  page_size: z.number().int().optional(),
  sort_by: z.string().optional(),
  has_promotion: z.boolean().optional(),
  collection_slug: z.string().optional(),
  ids: z.array(z.number().int()).optional(),
});

export const autocompleteCatalogParamsSchema = z.object({
  q: z.string(),
  collection: z.string(),
  limit: z.number().int().optional(),
});

export const facetCountSchema = z.object({
  value: z.string(),
  count: z.number().int(),
  highlighted: z.boolean().optional(),
});

export const facetSchema = z.object({
  field_name: z.string(),
  counts: z.array(facetCountSchema),
  stats: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      avg: z.number().optional(),
      sum: z.number().optional(),
    })
    .optional(),
});

export const searchProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.string(),
  store_id: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
  category_id: z.number().int(),
  category_name: z.string(),
  main_image_url: z.string().url(),
  max_price: z.number(),
  min_price: z.number(),
  variant_mode: z.string(),
  min_promotion_price: z.number().optional(),
  max_promotion_price: z.number().optional(),
  max_discount_percentage: z.number().optional(),
  has_promotion: z.boolean().optional(),
  promotion_start_date: z.number().optional(),
  promotion_end_date: z.number().optional(),
  total_sales: z.number().int().optional(),
  sales_last_30_days: z.number().int().optional(),
  total_stock_quantity: z.number().int().optional(),
  has_stock: z.boolean().optional(),
  trending_score: z.number().optional(),
  view_count: z.number().int().optional(),
  view_count_last_7_days: z.number().int().optional(),
  rating_average: z.number().optional(),
  review_count: z.number().int().optional(),
  variant_count: z.number().int().optional(),
  collection_ids: z.array(z.number().int()).optional(),
  collection_slugs: z.array(z.string()).optional(),
});

export const searchCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  store_id: z.number(),
});

export const searchBlogParamsSchema = z.object({
  q: z.string().optional(),
  collection: z.string(),
  status: z.string().optional(),
  categories: z.string().optional(),
  tags: z.string().optional(),
  page: z.number().int().optional(),
  page_size: z.number().int().optional(),
  sort_by: z.string().optional(),
});

export const searchBlogSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  featured_image_url: z.string().url(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  reading_time: z.number(),
  view_count: z.number(),
  published_at: z.number(),
});

export function createSearchResponseSchema<T extends z.ZodTypeAny>(
  documentSchema: T
) {
  return z.object({
    data: z.array(
      z.object({
        document: documentSchema,
        highlight: z.record(
          z.string(),
          z.object({
            matched_tokens: z.array(z.string()),
            snippet: z.string(),
          })
        ),
        highlights: z.array(
          z.object({
            field: z.string(),
            matched_tokens: z.array(z.string()),
            snippet: z.string(),
          })
        ),
      })
    ),
    found: z.number().int(),
    page: z.number().int(),
    facet_counts: z.array(facetSchema).optional(),
    request_params: z.object({
      per_page: z.number().int().optional(),
      q: z.string().optional(),
    }),
  });
}

export const productSearchResponseSchema =
  createSearchResponseSchema(searchProductSchema);
export const categorySearchResponseSchema =
  createSearchResponseSchema(searchCategorySchema);
export const blogSearchResponseSchema =
  createSearchResponseSchema(searchBlogSchema);

export type ProductSearchParams = z.infer<typeof searchCatalogParamsSchema>;
export type AutocompleteParams = z.infer<typeof autocompleteCatalogParamsSchema>;
export type SearchProduct = z.infer<typeof searchProductSchema>;
export type SearchCategory = z.infer<typeof searchCategorySchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
export type CategorySearchResponse = z.infer<typeof categorySearchResponseSchema>;
export type BlogSearchParams = z.infer<typeof searchBlogParamsSchema>;
export type BlogSearchResponse = z.infer<typeof blogSearchResponseSchema>;
