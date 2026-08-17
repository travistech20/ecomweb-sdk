import { z } from "zod";
import {
  productReviewStatsSchema,
  ProductReviewStats,
} from "./product-review";
import {
  timestampSchema,
  productStatusSchema,
  variantStatusSchema,
  moneySchema,
  decimalSchema,
  jsonSchema,
  dimensionsSchema,
  positionOrderSchema,
  idSchema,
  OptionalTimestamp,
  Id,
  ProductStatus,
  VariantStatus,
} from "./common";

/**
 * Product-related schemas based on Prisma models
 */

// Product interface
export interface Product extends OptionalTimestamp {
  id: Id;
  name: string;
  slug: string | null;
  description: string | null;
  status: ProductStatus;
  category_id: Id | null;
  is_featured: boolean;
  min_price: number | null;
  max_price: number | null;
  variant_mode: string;
  external_id: string | null;
  images: Array<any>; // Array of image objects
  videos?: ProductVideo[]; // Product videos
}

// Infer dimensions type from dimensionsSchema
type Dimensions = z.infer<typeof dimensionsSchema>;

// Product variant interface
export interface ProductVariant extends OptionalTimestamp {
  id: Id;
  product_id: Id;
  sku_id: Id;
  seller_sku: string | null;
  external_id: string | null;
  price: number;
  inventory: number;
  weight: number | null;
  dimensions: Dimensions;
  is_default: boolean;
  status: VariantStatus;
}

// Variant option interface
export interface VariantOption extends OptionalTimestamp {
  id: Id;
  name: string;
  sort_order: number;
}

// Variant option value interface
export interface VariantOptionValue extends OptionalTimestamp {
  id: Id;
  option_id: Id;
  value: string;
  display_value: string;
  image_url: string;
  sort_order: number;
  swatch_type: "none" | "color" | "image";
  swatch_value: string;
}

// Product variant combination interface
export interface ProductVariantCombination {
  id: Id;
  variant_id: Id;
  option_id: Id;
  option_value_id: Id;
  created_at: string;
}

// Create/Update types
export type CreateProduct = Omit<Product, "id" | keyof OptionalTimestamp>;
export type UpdateProduct = Partial<CreateProduct>;

export type CreateProductVariant = Omit<
  ProductVariant,
  "id" | "sku_id" | keyof OptionalTimestamp
>;
export type UpdateProductVariant = Partial<
  Omit<CreateProductVariant, "product_id">
>;

export type CreateVariantOption = Omit<
  VariantOption,
  "id" | keyof OptionalTimestamp
>;
export type UpdateVariantOption = Partial<CreateVariantOption>;

export type CreateVariantOptionValue = Omit<
  VariantOptionValue,
  "id" | keyof OptionalTimestamp
>;
export type UpdateVariantOptionValue = Partial<CreateVariantOptionValue>;

// Extended types for relationships
export interface ProductWithVariants extends Product {
  variants?: ProductVariantWithCombinations[];
}

export interface ProductVariantWithCombinations extends ProductVariant {
  combinations?: Array<{
    option_id: Id;
    option_value_id: Id;
    option_name: string;
    option_value: string;
  }>;
}

// Product response extended with optional per-product review_stats
export interface ProductWithReviewStats extends Product {
  review_stats?: ProductReviewStats | null;
}

// Product main entity
export const productSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    slug: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    status: productStatusSchema.default("active"),
    category_id: idSchema.optional().nullable(),
    is_featured: z.boolean().default(false),
    min_price: moneySchema.optional().nullable(),
    max_price: moneySchema.optional().nullable(),
    variant_mode: z.string(),
    external_id: z.string().optional().nullable(),
    images: jsonSchema, // Array of image objects
  })
  .extend(timestampSchema.shape);

// Product variant
export const productVariantSchema = z
  .object({
    id: idSchema,
    product_id: idSchema,
    sku_id: idSchema,
    seller_sku: z.string().optional().nullable(),
    external_id: z.string().optional().nullable(),
    price: moneySchema,
    inventory: z.int32().default(0),
    weight: decimalSchema.optional().nullable(),
    dimensions: dimensionsSchema,
    is_default: z.boolean().default(false),
    status: variantStatusSchema.default("active"),
  })
  .extend(timestampSchema.shape);

// Variant options (like Color, Size)
export const variantOptionSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    sort_order: positionOrderSchema,
  })
  .extend(timestampSchema.shape);

// Variant option values (like Red, Blue for Color)
export const variantOptionValueSchema = z
  .object({
    id: idSchema,
    option_id: idSchema,
    value: z.string().min(1),
    display_value: z.string().min(1),
    image_url: z.string().default(""),
    sort_order: positionOrderSchema,
    swatch_type: z.enum(["none", "color", "image"]),
    swatch_value: z.string(),
  })
  .extend(timestampSchema.shape);

// Product variant combinations (which options/values belong to which variant)
export const productVariantCombinationSchema = z.object({
  id: idSchema,
  variant_id: idSchema,
  option_id: idSchema,
  option_value_id: idSchema,
  created_at: z.iso.datetime(),
});

// Create product schema
export const createProductSchema = productSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}) as unknown as z.ZodType<CreateProduct>;

// Update product schema
export const updateProductSchema = productSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial() as unknown as z.ZodType<UpdateProduct>;

// Create product variant schema
export const createProductVariantSchema = productVariantSchema.omit({
  id: true,
  sku_id: true,
  created_at: true,
  updated_at: true,
}) as unknown as z.ZodType<CreateProductVariant>;

// Update product variant schema
export const updateProductVariantSchema = productVariantSchema
  .omit({
    id: true,
    sku_id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
  .omit({
    product_id: true,
  }) as unknown as z.ZodType<UpdateProductVariant>;

// Create variant option schema
export const createVariantOptionSchema = variantOptionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}) as unknown as z.ZodType<CreateVariantOption>;

// Update variant option schema
export const updateVariantOptionSchema = variantOptionSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial() as unknown as z.ZodType<UpdateVariantOption>;

// Create variant option value schema
export const createVariantOptionValueSchema = variantOptionValueSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}) as unknown as z.ZodType<CreateVariantOptionValue>;

// Update variant option value schema
export const updateVariantOptionValueSchema = variantOptionValueSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
  .omit({
    option_id: true,
  }) as unknown as z.ZodType<UpdateVariantOptionValue>;

// Product variant with combinations schema
export const productVariantWithCombinationsSchema = productVariantSchema.extend(
  {
    combinations: z
      .array(
        productVariantCombinationSchema.extend({
          attributes: variantOptionSchema,
          attribute_values: variantOptionValueSchema,
        }),
      )
      .optional(),
  },
) as unknown as z.ZodType<ProductVariantWithCombinations>;

// Per-product attribute link value (e.g. a specific color/size choice)
export const attributeLinkValueSchema = z.object({
  key: z.string(),
  display: z.string(),
  swatch_type: z.enum(["none", "color", "image"]),
  swatch_value: z.string(),
  attribute_value_id: z.number().nullable(),
});

// Per-product attribute link (product_attributes on the API)
export const attributeLinkSchema = z.object({
  id: z.number(),
  position: z.number(),
  group: z.string().nullable(),
  is_visible: z.boolean(),
  is_variation: z.boolean(),
  attribute_id: z.number().nullable(),
  custom_name: z.string().nullable(),
  name: z.string(),
  values: z.array(attributeLinkValueSchema),
});
export type AttributeLink = z.infer<typeof attributeLinkSchema>;

// Product with variants schema
export const productWithVariantsSchema = productSchema.extend({
  variants: z.array(productVariantWithCombinationsSchema).optional(),
});

// Product schema extended with optional review_stats
export const productWithReviewStatsSchema = productSchema.extend({
  review_stats: productReviewStatsSchema.optional().nullable(),
});

// Product with variants + optional review_stats
export const productWithVariantsAndReviewStatsSchema =
  productWithVariantsSchema.extend({
    review_stats: productReviewStatsSchema.optional().nullable(),
  }) as unknown as z.ZodType<ProductWithVariants & ProductWithReviewStats>;

export interface ProductImage {
  url: string;
  design_id?: string;
  design_edit_url?: string;
  canva_asset_id?: string;
  created_at?: string;
  updated_at?: string;
  // Additional metadata fields
  alt?: string;
  caption?: string;
  sort_order?: number;
  is_primary?: boolean;
}

// Product Video interface
export interface ProductVideo {
  id: string; // Asset ID
  url: string; // Public video URL
  thumbnail_url?: string; // Video thumbnail
  duration?: number; // Duration in seconds
  width?: number; // Video width
  height?: number; // Video height
  file_size?: number; // File size in bytes
  status?: "processing" | "active" | "failed";
}
