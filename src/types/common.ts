import { z } from "zod";

/**
 * Common schemas and validators used across all entities
 * Updated for Zod v4 syntax with explicit TypeScript types
 */

// Re-export product status schemas from dedicated module (single source of truth)
export {
  productStatusSchema,
  ProductStatus,
  inventoryStatusSchema,
  InventoryStatus,
  PRODUCT_STATUS_LABELS,
  INVENTORY_STATUS_LABELS,
  isPublishableStatus,
  isUnpublishedStatus,
  isEditableStatus,
} from "./product-status";

// Base timestamp interface
interface Timestamp {
  created_at: string;
  updated_at: string;
}

// Optional timestamp interface
interface OptionalTimestamp {
  created_at?: string | null;
  updated_at?: string | null;
}

// Deleted timestamp interface
interface DeletedAt {
  deleted_at?: string | null;
}

// Base timestamp schema for created_at/updated_at fields
export const timestampSchema = z.object({
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// Optional timestamp schema for entities that might not have timestamps
export const optionalTimestampSchema = z.object({
  created_at: z.iso.datetime().optional().nullable(),
  updated_at: z.iso.datetime().optional().nullable(),
});

// Deleted timestamp for soft deletes
export const deletedAtSchema = z.object({
  deleted_at: z.iso.datetime().optional().nullable(),
});

// UUID schema using v4 syntax
export const uuidSchema = z.uuidv4();

// ID schemas using v4 syntax
export const idSchema = z.int32().positive();
export const storeIdSchema = z.int32().positive();

// Status enums
export const storeStatusSchema = z.enum(["pending", "active", "disabled"]);
export type StoreStatus = "pending" | "active" | "disabled";

/**
 * @deprecated Use productStatusSchema and ProductStatus from './product-status' instead
 * This legacy definition will be removed in a future version.
 * Migration: "inactive" → "archived", inventory statuses moved to inventoryStatusSchema
 */
export const legacyProductStatusSchema = z.enum([
  "active",
  "inactive",
  "draft",
]);
export type LegacyProductStatus = "active" | "inactive" | "draft";

// NEW: Separate status enums for state machine management
export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "cancelled",
  "on_hold",
  "completed",
]);
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "cancelled"
  | "on_hold"
  | "completed";

export const fulfillmentStatusSchema = z.enum([
  "unfulfilled",
  "fulfilled",
  "returned",
  "return_requested",
]);
export type FulfillmentStatus =
  | "unfulfilled"
  | "fulfilled"
  | "returned"
  | "return_requested";

export const shippingStatusSchema = z.enum([
  "not_shipped",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "delivery_failed",
]);
export type ShippingStatus =
  | "not_shipped"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed";

export const paymentStatusSchema = z.enum([
  "pending",
  "authorized",
  "paid",
  "captured",
  "failed",
  "refunded",
  "voided",
]);
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "captured"
  | "failed"
  | "refunded"
  | "voided";

// DEPRECATED: Legacy order status for backward compatibility
export const legacyOrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "completed",
]);
export type LegacyOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "completed";

/**
 * The set of payment methods this SDK has shipped labels for. It is a hint for
 * UI, NOT a constraint: each store defines its own enabled methods, and the API
 * validates a submitted method against that store's configuration. Adding a
 * gateway must not require an SDK release.
 */
export const KNOWN_PAYMENT_METHODS = [
  "cod",
  "bank_transfer",
  "e_wallet",
  "credit_card",
  "momo",
  "zalopay",
  "vnpay",
  "onepay",
] as const;

export const paymentMethodSchema = z.string().min(1);
export type PaymentMethod = string;

export const blogPostStatusSchema = z.enum([
  "draft",
  "published",
  "scheduled",
  "unlisted",
]);
export type BlogPostStatus = "draft" | "published" | "scheduled" | "unlisted";

export const integrationStatusSchema = z.enum(["active", "inactive", "error"]);
export type IntegrationStatus = "active" | "inactive" | "error";

export const variantStatusSchema = z.enum([
  "active",
  "inactive",
  "out_of_stock",
]);
export type VariantStatus = "active" | "inactive" | "out_of_stock";

export const messageOutboxStatusSchema = z.enum([
  "PENDING",
  "PUBLISHED",
  "FAILED",
]);
export type MessageOutboxStatus = "PENDING" | "PUBLISHED" | "FAILED";

// Common type aliases for better readability
export type Id = number;

// Export interfaces for reuse
export type { Timestamp, OptionalTimestamp, DeletedAt };

// Common validation patterns using v4 syntax
export const emailSchema = z.email();
export const phoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]+$/)
  .optional()
  .nullable();
export const urlSchema = z.url().optional().nullable();
export const strictUrlSchema = z.url(); // For required URLs
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/);
export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .optional()
  .nullable();

// Optional URL that allows empty string
export const optionalUrlSchema = z.url().optional().or(z.literal(""));

// Decimal/money values
export const moneySchema = z.float64().multipleOf(0.01);
export const decimalSchema = z.float64();

// JSON field schema
export const jsonSchema = z.record(z.string(), z.any());

// Pagination schema
export const paginationSchema = z.object({
  page: z.int32().min(1).default(1),
  limit: z.int32().min(1).max(100).default(20),
});

// Sort order schema
export const positionOrderSchema = z.int32().default(0);

export const sortOrderSchema = z.enum(["asc", "desc"]);

// Image dimensions schema
export const dimensionsSchema = z
  .object({
    width: z.float64(),
    height: z.float64(),
    length: z.float64().optional(),
  })
  .optional()
  .nullable();
