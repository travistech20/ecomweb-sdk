import { z } from "zod";

/**
 * Product Status Schema - Single Source of Truth
 *
 * This schema standardizes product status across the entire e-commerce system,
 * following industry best practices from Shopify, WooCommerce, and Magento.
 *
 * IMPORTANT: Product status (lifecycle/publishing) is separate from inventory status.
 * - Product Status: Controls visibility and publishing state
 * - Inventory Status: Computed from stock quantity (not a product attribute)
 */

// ============================================================================
// Product Status (Lifecycle/Publishing)
// ============================================================================

/**
 * Product lifecycle and publishing status
 *
 * Status Flow:
 * draft → active → unlisted
 *
 * State transitions are enforced by the product state machine:
 * @see apps/api/src/modules/catalog/domain/validators/product-status-state-machine.ts
 */
export const productStatusSchema = z.enum([
  "draft", // Work in progress, not visible to customers
  "active", // Published and visible to customers
  "unlisted", // Hidden from public view, can be restored
]);

/**
 * TypeScript type inferred from product status schema
 */
export type ProductStatus = z.infer<typeof productStatusSchema>;

/**
 * Product status enum for use in application code
 * Provides autocomplete and type safety
 */
export const ProductStatus = {
  DRAFT: "draft" as const,
  ACTIVE: "active" as const,
  UNLISTED: "unlisted" as const,
} as const;

// ============================================================================
// Inventory Status (Computed - NOT a Product Attribute)
// ============================================================================

/**
 * Inventory availability status - COMPUTED from stock quantity
 *
 * IMPORTANT: This is NOT stored as a product field!
 * It is dynamically calculated based on:
 * - variant.quantity
 * - store.low_stock_threshold
 * - variant.backorder_allowed
 *
 * Historical Note:
 * Previously, "out_of_stock" and "low_stock" were incorrectly stored as
 * product status values. They are now computed inventory states.
 */
export const inventoryStatusSchema = z.enum([
  "in_stock", // Quantity > low_stock_threshold
  "low_stock", // Quantity <= low_stock_threshold && quantity > 0
  "out_of_stock", // Quantity = 0 && !backorder_allowed
  "backordered", // Quantity = 0 && backorder_allowed
]);

/**
 * TypeScript type inferred from inventory status schema
 */
export type InventoryStatus = z.infer<typeof inventoryStatusSchema>;

/**
 * Inventory status enum for use in application code
 */
export const InventoryStatus = {
  IN_STOCK: "in_stock" as const,
  LOW_STOCK: "low_stock" as const,
  OUT_OF_STOCK: "out_of_stock" as const,
  BACKORDERED: "backordered" as const,
} as const;

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Maps legacy product status values to new standardized values
 * Used during data migration and backward compatibility
 */
export const LEGACY_STATUS_MIGRATION_MAP = {
  active: ProductStatus.ACTIVE,
  inactive: ProductStatus.UNLISTED, // inactive → unlisted
  archived: ProductStatus.UNLISTED, // archived → unlisted (old status)
  pending: ProductStatus.DRAFT, // pending → draft (removed approval workflow)
  scheduled: ProductStatus.DRAFT, // scheduled → draft (removed scheduling)
  draft: ProductStatus.DRAFT,
  out_of_stock: ProductStatus.ACTIVE, // Was inventory status, map to active
  low_stock: ProductStatus.ACTIVE, // Was inventory status, map to active
} as const;

/**
 * Product status labels for UI display (Vietnamese)
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Nháp",
  active: "Hoạt động",
  unlisted: "Không công khai",
};

/**
 * Inventory status labels for UI display (Vietnamese)
 */
export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết hàng",
  out_of_stock: "Hết hàng",
  backordered: "Cho phép đặt trước",
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a product status is publishable (visible to customers)
 */
export function isPublishableStatus(status: ProductStatus): boolean {
  return status === ProductStatus.ACTIVE;
}

/**
 * Check if a product status represents a non-published state
 */
export function isUnpublishedStatus(status: ProductStatus): boolean {
  return status === ProductStatus.DRAFT || status === ProductStatus.UNLISTED;
}

/**
 * Check if a product status allows editing
 */
export function isEditableStatus(status: ProductStatus): boolean {
  return status === ProductStatus.DRAFT;
}
