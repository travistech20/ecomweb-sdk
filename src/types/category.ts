import { z } from "zod";
import {
  optionalTimestampSchema,
  urlSchema,
  positionOrderSchema,
  idSchema,
  OptionalTimestamp,
  Id,
} from "./common";

/**
 * Category-related schemas based on Prisma models
 */

// Category interface
export interface Category extends OptionalTimestamp {
  id: Id;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  parent_id: Id | null;
  sort_order: number;
  is_active: boolean;
  external_cat_id: string | null;
}

// Category with children interface
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// Category tree type
export type CategoryTree = CategoryWithChildren[];

// Create category input type
export type CreateCategory = Omit<Category, "id" | keyof OptionalTimestamp>;

// Update category input type
export type UpdateCategory = Partial<CreateCategory>;

// Category main entity
export const categorySchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    slug: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    image_url: urlSchema,
    parent_id: idSchema.optional().nullable(),
    sort_order: positionOrderSchema,
    is_active: z.boolean().default(true),
    external_cat_id: z.string().optional().nullable(),
  })
  .extend(optionalTimestampSchema.shape);

// Create category input
export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update category input
export const updateCategorySchema = createCategorySchema.partial();

// Category with children (using explicit interface)
export const categoryWithChildrenSchema = categorySchema.extend({
  children: z.array(z.lazy(() => categoryWithChildrenSchema)).optional(),
}) as unknown as z.ZodType<CategoryWithChildren>;

// Category tree structure
export const categoryTreeSchema = z.array(
  categoryWithChildrenSchema,
) as unknown as z.ZodType<CategoryTree>;
