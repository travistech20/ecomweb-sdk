import type { OrderActorType } from "./order-timeline";

/**
 * Inventory: stock states per variant and location, served to admin clients
 * under `stores/:storeRef/inventory` (contract:
 * docs/superpowers/plans/2026-09-15-inventory-contracts.md in the api repo).
 *
 * This SDK owns the vocabulary; the API pins it with
 * inventory-vocabulary.contract.spec.ts because the API cannot import the SDK.
 * Types only: the dashboard calls the admin routes through its own client.
 *
 * This module's vocabulary (`InventoryState`, `INVENTORY_STATES`, and the
 * related state lists below) is the set of ledger buckets a unit of stock can
 * sit in: available, committed, damaged, and so on. It is unrelated to
 * `InventoryStatus` in `./product-status`, which is a different, display-level
 * concept: a computed status (`in_stock` / `low_stock` / `out_of_stock` /
 * `backordered`) derived from a quantity threshold, with Vietnamese UI
 * labels. Do not wire a stock badge or filter to the wrong one.
 */
export const INVENTORY_STATES = [
  "available",
  "committed",
  "damaged",
  "quality_control",
  "safety_stock",
  "other",
  "incoming",
] as const;
export type InventoryState = (typeof INVENTORY_STATES)[number];

/** Shown together as "Unavailable". */
export const UNAVAILABLE_STATES = [
  "damaged",
  "quality_control",
  "safety_stock",
  "other",
] as const satisfies readonly InventoryState[];
export type UnavailableState = (typeof UNAVAILABLE_STATES)[number];

/** States a merchant may set, adjust or move between. `committed` and `incoming` are system-managed. */
export const ADJUSTABLE_STATES = [
  "available",
  "damaged",
  "quality_control",
  "safety_stock",
  "other",
] as const satisfies readonly InventoryState[];
export type AdjustableState = (typeof ADJUSTABLE_STATES)[number];

/** deny: checkout rejects when available is short. continue: available may go negative. */
export const INVENTORY_POLICIES = ["deny", "continue"] as const;
export type InventoryPolicy = (typeof INVENTORY_POLICIES)[number];

export const INVENTORY_ADJUSTMENT_REASONS = [
  // Reasons a merchant picks
  "correction",
  "count",
  "received",
  "return_restock",
  "damaged",
  "theft_or_loss",
  "promotion_or_donation",
  // Reasons the system records
  "initial_stock",
  "order_reserved",
  "order_fulfilled",
  "order_released",
  "order_restocked",
  "cancelled_not_restocked",
  "migration_backfill",
  "purchase_order_ordered",
  "purchase_order_edited",
  "purchase_order_cancelled",
  "purchase_order_closed",
] as const;
export type InventoryAdjustmentReason =
  (typeof INVENTORY_ADJUSTMENT_REASONS)[number];

export const MERCHANT_ADJUSTMENT_REASONS = [
  "correction",
  "count",
  "received",
  "return_restock",
  "damaged",
  "theft_or_loss",
  "promotion_or_donation",
] as const;
export type MerchantAdjustmentReason =
  (typeof MERCHANT_ADJUSTMENT_REASONS)[number];

/** `code` values of inventory business errors. Localise from these, never from `message`. */
export const INVENTORY_ERROR_CODES = {
  /** 409. `details.items: InsufficientInventoryItem[]`. */
  INSUFFICIENT_INVENTORY: "INSUFFICIENT_INVENTORY",
  /** 409. `details.states: [{ variant_id, state, quantity }]`. */
  STATE_NEGATIVE: "INVENTORY_STATE_NEGATIVE",
  /** 404. `details.variant_ids: number[]`. */
  VARIANT_NOT_IN_STORE: "INVENTORY_VARIANT_NOT_IN_STORE",
  /** 400. `details.variant_ids: number[]`. */
  DUPLICATE_VARIANT: "INVENTORY_DUPLICATE_VARIANT",
  /** 409. `details: SetQuantitiesResponse`; the non-stale items WERE applied. */
  QUANTITY_STALE: "INVENTORY_QUANTITY_STALE",
  /** 400. More than 5,000 data rows. */
  IMPORT_TOO_LARGE: "INVENTORY_IMPORT_TOO_LARGE",
  /** 400. `details.missing_columns?: string[]`. */
  IMPORT_INVALID_FILE: "INVENTORY_IMPORT_INVALID_FILE",
} as const;
export type InventoryErrorCode =
  (typeof INVENTORY_ERROR_CODES)[keyof typeof INVENTORY_ERROR_CODES];

/** One entry of an `INSUFFICIENT_INVENTORY` error's `details.items`. */
export interface InsufficientInventoryItem {
  variant_id: number;
  requested: number;
  available: number;
}

export interface InventoryQuantities {
  available: number;
  committed: number;
  damaged: number;
  quality_control: number;
  safety_stock: number;
  other: number;
}

/** What is physically held: everything except incoming. */
export function onHand(level: InventoryQuantities): number {
  return (
    level.available +
    level.committed +
    level.damaged +
    level.quality_control +
    level.safety_stock +
    level.other
  );
}

export function unavailable(
  level: Pick<InventoryQuantities, UnavailableState>,
): number {
  return (
    level.damaged + level.quality_control + level.safety_stock + level.other
  );
}

/** One row of `GET /inventory/levels`: a variant at a location. */
export interface InventoryLevelRow extends InventoryQuantities {
  variant_id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  /** Option values joined with " / ", null for a default-only product. */
  variant_title: string | null;
  /** product_variants.seller_sku */
  sku: string | null;
  location_id: number;
  track_inventory: boolean;
  inventory_policy: InventoryPolicy;
  unavailable: number;
  on_hand: number;
  incoming: number;
  /** ISO 8601. */
  updated_at: string;
}

export interface StaleQuantity {
  variant_id: number;
  state: "available" | "on_hand";
  expected_quantity: number;
  current_quantity: number;
}

export interface SetQuantitiesRequest {
  /** 1 to 250 items. */
  items: Array<{
    variant_id: number;
    state: "available" | "on_hand";
    quantity: number;
    /** Omit for last-write-wins; send the value you displayed to detect a concurrent edit. */
    expected_quantity?: number | null;
  }>;
  reason: MerchantAdjustmentReason;
  /** Max 500. */
  note?: string | null;
  /** Max 100. A replay returns `replayed: true` and writes nothing. */
  idempotency_key?: string | null;
}

/** 200 when `stale` is empty; otherwise the `details` of a 409 `INVENTORY_QUANTITY_STALE`. */
export interface SetQuantitiesResponse {
  applied: InventoryLevelRow[];
  stale: StaleQuantity[];
  replayed: boolean;
}

export interface AdjustQuantitiesRequest {
  /** 1 to 250 items, `delta` never 0. */
  items: Array<{ variant_id: number; state: AdjustableState; delta: number }>;
  reason: MerchantAdjustmentReason;
  note?: string | null;
  idempotency_key?: string | null;
}

export interface MoveQuantitiesRequest {
  /** 1 to 250 items, `from !== to`, `quantity > 0`. */
  items: Array<{
    variant_id: number;
    from: AdjustableState;
    to: AdjustableState;
    quantity: number;
  }>;
  /** Defaults to "correction". */
  reason?: MerchantAdjustmentReason;
  note?: string | null;
  idempotency_key?: string | null;
}

export interface QuantitiesResponse {
  applied: InventoryLevelRow[];
  replayed: boolean;
}

export interface InventoryActor {
  type: OrderActorType;
  id: string | null;
  name: string | null;
}

/** One adjustment group of `GET /inventory/variants/:variantId/history`, newest first. */
export interface InventoryHistoryEntry {
  id: number;
  /** ISO 8601. */
  created_at: string;
  reason: InventoryAdjustmentReason;
  note: string | null;
  actor: InventoryActor;
  /** `label` is the order code, or "PO1042". */
  reference: { type: "order" | "purchase_order"; id: number; label: string } | null;
  changes: Array<{ state: InventoryState; delta: number; quantity_after: number }>;
}

export interface InventoryImportResponse {
  applied: number;
  unchanged: number;
  skipped: Array<{
    /** 1-based data row, header excluded. */
    row: number;
    variant_id: string | null;
    reason:
      | "stale"
      | "not_found"
      | "invalid_quantity"
      | "missing_variant_id"
      /** The second and later rows repeating a Variant ID; the first one applied. */
      | "duplicate_variant_id";
    current_on_hand: number | null;
  }>;
}

export interface InventoryLocation {
  id: number;
  name: string;
  is_default: boolean;
}
