import { z } from "zod";
import { timestampSchema, sortOrderSchema } from "./common";

// Pagination meta schema
export const paginationMetaSchema = z.object({
  total: z.uint32(),
  limit: z.int32().positive(),
  offset: z.uint32(),
  page: z.int32().positive(),
  totalPages: z.uint32(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Generic paginated response schema
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });

// Base query parameters schema
export const baseQueryParamsSchema = z.object({
  limit: z.int32().min(1).max(100).optional(),
  offset: z.uint32().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: sortOrderSchema.optional(),
  created_after: timestampSchema.optional(),
  created_before: timestampSchema.optional(),
  updated_after: timestampSchema.optional(),
  updated_before: timestampSchema.optional(),
});

// Base delete options schema
export const baseDeleteOptionsSchema = z.object({
  soft_delete: z.boolean().optional(),
  reason: z.string().optional(),
  force: z.boolean().optional(),
});

// Base delete result schema
export const baseDeleteResultSchema = z.object({
  success: z.boolean(),
  type: z.enum(["soft", "hard"]),
  message: z.string(),
  entity_id: z.union([z.number(), z.string()]),
  deleted_at: timestampSchema.optional(),
});

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_OFFSET: 0,
  DEFAULT_ORDER: "desc" as const,
} as const;

// Inferred types
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
export type BaseQueryParams = z.infer<typeof baseQueryParamsSchema>;
export type BaseDeleteOptions = z.infer<typeof baseDeleteOptionsSchema>;
export type BaseDeleteResult = z.infer<typeof baseDeleteResultSchema>;

// Utility type for creating paginated API functions
export type PaginatedApiFunction<
  T,
  Q extends BaseQueryParams = BaseQueryParams,
> = (query?: Q) => Promise<PaginatedResponse<T>>;

// Utility type for creating single entity API functions
export type SingleEntityApiFunction<T, Q = any> = (
  query: Q,
) => Promise<T | null>;

// Utility type for create/update operations
export type MutationApiFunction<TData, TInput> = (
  input: TInput,
) => Promise<TData>;

// Utility type for delete operations
export type DeleteApiFunction<
  TResult extends BaseDeleteResult = BaseDeleteResult,
> = (id: number, options?: BaseDeleteOptions) => Promise<TResult>;

// Validation functions
export const validatePaginationMeta = (data: unknown) => {
  try {
    return paginationMetaSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(z.prettifyError(error));
    }
    throw error;
  }
};

// Safe validation functions
export const safeParsePaginationMeta = (data: unknown) =>
  paginationMetaSchema.safeParse(data);
export const safeParseBaseQueryParams = (data: unknown) =>
  baseQueryParamsSchema.safeParse(data);
