import { z } from "zod";
import {
  idSchema,
  uuidSchema,
  emailSchema,
  timestampSchema,
  deletedAtSchema,
} from "./common";
import { baseQueryParamsSchema } from "./pagination";

// Review status enum (matches Prisma enum ReviewStatus)
export const reviewStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "HIDDEN",
]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

// Product review reply
export const productReviewReplySchema = z
  .object({
    id: uuidSchema,
    review_id: uuidSchema,
    content: z.string().min(1),
    author_id: uuidSchema,
    author_name: z.string().min(1),
    is_visible: z.boolean().default(true),
  })
  .extend(timestampSchema.shape)
  .extend(deletedAtSchema.shape);

export const createProductReviewReplySchema = productReviewReplySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const updateProductReviewReplySchema = productReviewReplySchema
  .partial()
  .omit({ id: true, review_id: true, created_at: true });

// Product review
export const productReviewSchema = z
  .object({
    id: uuidSchema,
    product_id: z.bigint(),
    product_name: z.string().min(1),
    variant_id: z.bigint().optional().nullable(),
    variant_name: z.string().optional().nullable(),
    order_id: z.bigint().optional().nullable(),
    order_number: z.bigint().optional().nullable(),
    user_id: uuidSchema.optional().nullable(),
    reviewer_name: z.string().min(1),
    reviewer_email: emailSchema,
    reviewer_avatar: z.string().url().optional().nullable(),
    is_verified_buyer: z.boolean().default(false),
    rating: z.int32().min(1).max(5),
    title: z.string().max(200).optional().nullable(),
    content: z.string().min(1),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    media: z.array(z.any()).default([]),
    status: reviewStatusSchema.default("PENDING"),
    moderation_notes: z.string().optional().nullable(),
    approved_by: uuidSchema.optional().nullable(),
    approved_at: z.iso.datetime().optional().nullable(),
    rejected_reason: z.string().optional().nullable(),
    is_featured: z.boolean().default(false),
    is_pinned: z.boolean().default(false),
    display_order: z.int32().optional().nullable(),
    review_date: z.iso.datetime().optional().nullable(),
  })
  .extend(timestampSchema.shape)
  .extend(deletedAtSchema.shape);

export const createProductReviewSchema = productReviewSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const updateProductReviewSchema = productReviewSchema
  .partial()
  .omit({ id: true, created_at: true });

// Product review with replies (hydrated relation)
export const productReviewWithRepliesSchema = productReviewSchema.extend({
  review_replies: z.array(productReviewReplySchema).optional(),
});

// Review statistics per product
export const productReviewStatsSchema = z.object({
  id: idSchema,
  product_id: z.bigint(),
  total_reviews: z.int32().default(0),
  verified_reviews: z.int32().default(0),
  reviews_with_media: z.int32().default(0),
  reviews_with_reply: z.int32().default(0),
  average_rating: z.float64().default(0),
  rating_1_count: z.int32().default(0),
  rating_2_count: z.int32().default(0),
  rating_3_count: z.int32().default(0),
  rating_4_count: z.int32().default(0),
  rating_5_count: z.int32().default(0),
  last_review_at: z.iso.datetime().optional().nullable(),
  last_calculated_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Query filter schemas
export const productReviewFiltersSchema = baseQueryParamsSchema.extend({
  id: uuidSchema.optional(),
  product_id: z.bigint().optional(),
  user_id: uuidSchema.optional(),
  rating: z.int32().min(1).max(5).optional(),
  min_rating: z.int32().min(1).max(5).optional(),
  max_rating: z.int32().min(1).max(5).optional(),
  status: reviewStatusSchema.optional(),
  is_verified_buyer: z.boolean().optional(),
  reviewer_email: emailSchema.optional(),
  reviewer_name: z.string().optional(),
  has_media: z.boolean().optional(),
  include_replies: z.boolean().optional(),
});

export const productReviewReplyFiltersSchema = baseQueryParamsSchema.extend({
  id: uuidSchema.optional(),
  review_id: uuidSchema.optional(),
  is_visible: z.boolean().optional(),
  author_id: uuidSchema.optional(),
});

// Types
export type ProductReview = z.infer<typeof productReviewSchema>;
export type CreateProductReview = z.infer<typeof createProductReviewSchema>;
export type UpdateProductReview = z.infer<typeof updateProductReviewSchema>;
export type ProductReviewWithReplies = z.infer<
  typeof productReviewWithRepliesSchema
>;
export type ProductReviewReply = z.infer<typeof productReviewReplySchema>;
export type CreateProductReviewReply = z.infer<
  typeof createProductReviewReplySchema
>;
export type UpdateProductReviewReply = z.infer<
  typeof updateProductReviewReplySchema
>;
export type ProductReviewStats = z.infer<typeof productReviewStatsSchema>;
export type ProductReviewFilters = z.infer<typeof productReviewFiltersSchema>;
export type ProductReviewReplyFilters = z.infer<
  typeof productReviewReplyFiltersSchema
>;
