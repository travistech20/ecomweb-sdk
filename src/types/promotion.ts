import { z } from "zod";
import { paginationMetaSchema } from "./pagination";

// Promotion Enums
export const PromotionModeSchema = z.enum(["DISCOUNT_CODE", "AUTOMATIC"]);
export const PromotionTypeSchema = z.enum([
  "PRODUCT_DISCOUNT",
  "CART_DISCOUNT",
  "FREE_SHIPPING",
  "FIXED_PRICE",
  "GIFT",
]);
export const DiscountMethodSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);
export const ConditionTypeSchema = z.enum([
  "PRODUCT",
  "CATEGORY",
  "VARIANT",
  "NONE",
]);
export const PromotionStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "DISABLED",
]);

// Export enum values for runtime use
export const PromotionMode = {
  DISCOUNT_CODE: "DISCOUNT_CODE",
  AUTOMATIC: "AUTOMATIC",
} as const;

export const PromotionType = {
  PRODUCT_DISCOUNT: "PRODUCT_DISCOUNT",
  CART_DISCOUNT: "CART_DISCOUNT",
  FREE_SHIPPING: "FREE_SHIPPING",
  FIXED_PRICE: "FIXED_PRICE",
  GIFT: "GIFT",
} as const;

export const DiscountMethod = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;

export const ConditionType = {
  PRODUCT: "PRODUCT",
  CATEGORY: "CATEGORY",
  VARIANT: "VARIANT",
  NONE: "NONE",
} as const;

export const PromotionStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  DISABLED: "DISABLED",
} as const;

// Export enum types
export type PromotionModeType =
  (typeof PromotionMode)[keyof typeof PromotionMode];
export type PromotionTypeType =
  (typeof PromotionType)[keyof typeof PromotionType];
export type DiscountMethodType =
  (typeof DiscountMethod)[keyof typeof DiscountMethod];
export type ConditionTypeType =
  (typeof ConditionType)[keyof typeof ConditionType];
export type PromotionStatusType =
  (typeof PromotionStatus)[keyof typeof PromotionStatus];

// Core Promotion Schema
export const PromotionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  mode: PromotionModeSchema,
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1000).optional(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().optional(),
  status: PromotionStatusSchema,
  type: PromotionTypeSchema,
  condition_type: ConditionTypeSchema,
  target_ids: z.array(z.string().uuid()).optional(),
  min_amount: z.number().positive().optional(),
  min_quantity: z.number().int().positive().optional(),
  discount_method: DiscountMethodSchema.optional(),
  discount_value: z.number().nonnegative().optional(),
  max_discount_amount: z.number().nonnegative().optional(),
  fixed_price: z.number().nonnegative().optional(),
  gift_product_ids: z.array(z.string().uuid()),
  gift_quantity: z.number().int().positive().optional(),
  usage_limit: z.number().int().positive().optional(),
  usage_limit_per_user: z.number().int().positive().optional(),
  checkout_suggestion_enabled: z.boolean().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
});

// Create Promotion Schema
export const CreatePromotionSchema = z.object({
  name: z.string().min(1, "Tên khuyến mãi là bắt buộc").max(255),
  mode: PromotionModeSchema,
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1000).optional(),
  start_at: z.iso.datetime(),
  end_at: z.iso.datetime().optional(),
  type: PromotionTypeSchema,
  condition_type: ConditionTypeSchema,
  target_ids: z
    .array(z.uuid())
    .optional()
    .superRefine((ids: any, ctx: any) => {
      const conditionType = ctx.parent?.condition_type;
      if (conditionType === "NONE") {
        return true; // Allow empty array for NONE condition
      }
      return ids && ids.length > 0;
    }),
  min_amount: z.number().positive().optional(),
  min_quantity: z.number().int().positive().optional(),
  discount_method: DiscountMethodSchema.optional(),
  discount_value: z.number().nonnegative().optional(),
  max_discount_amount: z.number().nonnegative().optional(),
  fixed_price: z.number().nonnegative().optional(),
  gift_product_ids: z.array(z.uuid()).optional(),
  gift_quantity: z.number().int().positive().optional(),
  usage_limit: z.number().int().positive().optional(),
  usage_limit_per_user: z.number().int().positive().optional(),
  checkout_suggestion_enabled: z.boolean().optional(),
});

// Update Promotion Schema
export const UpdatePromotionSchema = CreatePromotionSchema.partial().extend({
  status: PromotionStatusSchema.optional(),
});

// Promotion with calculated discount amount (for API responses)
export const PromotionWithDiscountSchema = PromotionSchema.extend({
  discount_amount: z.number().optional(),
});

// Promotion Statistics Schema
export const PromotionStatisticsSchema = z.object({
  total_promotions: z.number().int().nonnegative(),
  active_promotions: z.number().int().nonnegative(),
  draft_promotions: z.number().int().nonnegative(),
  expired_promotions: z.number().int().nonnegative(),
  disabled_promotions: z.number().int().nonnegative(),
  total_usage: z.number().int().nonnegative(),
  total_discount_amount: z.number().nonnegative(),
  top_promotions: z.array(PromotionSchema),
});

// Pagination Schema
export const PaginatedPromotionsResponseSchema = z.object({
  data: z.array(PromotionSchema),
  meta: paginationMetaSchema,
});

// Query Parameters Schema
export const PromotionQueryParamsSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  sort: z
    .enum([
      "name",
      "start_at",
      "end_at",
      "status",
      "type",
      "created_at",
      "updated_at",
    ])
    .optional(),
  search: z.string().max(255).optional(),
  status: z.union([PromotionStatusSchema, z.literal("all")]).optional(),
  type: z.union([PromotionTypeSchema, z.literal("all")]).optional(),
  mode: z.union([PromotionModeSchema, z.literal("all")]).optional(),
});

// Export types
export type Promotion = z.infer<typeof PromotionSchema>;
export type CreatePromotion = z.infer<typeof CreatePromotionSchema>;
export type UpdatePromotion = z.infer<typeof UpdatePromotionSchema>;
export type PromotionWithDiscount = z.infer<typeof PromotionWithDiscountSchema>;
export type PromotionStatistics = z.infer<typeof PromotionStatisticsSchema>;
export type PaginatedPromotionsResponse = z.infer<
  typeof PaginatedPromotionsResponseSchema
>;
export type PromotionQueryParams = z.infer<typeof PromotionQueryParamsSchema>;

// UI Constants
export const PROMOTION_MODE_LABELS: Record<PromotionModeType, string> = {
  DISCOUNT_CODE: "Mã giảm giá",
  AUTOMATIC: "Tự động áp dụng",
};

export const PROMOTION_TYPE_LABELS: Record<PromotionTypeType, string> = {
  PRODUCT_DISCOUNT: "Giảm giá sản phẩm",
  CART_DISCOUNT: "Giảm giá giỏ hàng",
  FREE_SHIPPING: "Miễn phí vận chuyển",
  FIXED_PRICE: "Giá cố định",
  GIFT: "Quà tặng",
};

export const DISCOUNT_METHOD_LABELS: Record<DiscountMethodType, string> = {
  PERCENTAGE: "Phần trăm",
  FIXED_AMOUNT: "Số tiền cố định",
};

export const CONDITION_TYPE_LABELS: Record<ConditionTypeType, string> = {
  PRODUCT: "Sản phẩm",
  CATEGORY: "Danh mục",
  VARIANT: "Biến thể",
  NONE: "Tất cả sản phẩm",
};

export const PROMOTION_STATUS_LABELS: Record<PromotionStatusType, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Đã hết hạn",
  DISABLED: "Đã tắt",
};

export const PROMOTION_STATUS_COLORS: Record<PromotionStatusType, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  DISABLED: "bg-yellow-100 text-yellow-800",
};

export const PROMOTION_TYPE_COLORS: Record<PromotionTypeType, string> = {
  PRODUCT_DISCOUNT: "bg-blue-100 text-blue-800",
  CART_DISCOUNT: "bg-purple-100 text-purple-800",
  FREE_SHIPPING: "bg-green-100 text-green-800",
  FIXED_PRICE: "bg-orange-100 text-orange-800",
  GIFT: "bg-pink-100 text-pink-800",
};

export const PROMOTION_MODE_COLORS: Record<PromotionModeType, string> = {
  DISCOUNT_CODE: "bg-indigo-100 text-indigo-800",
  AUTOMATIC: "bg-emerald-100 text-emerald-800",
};
