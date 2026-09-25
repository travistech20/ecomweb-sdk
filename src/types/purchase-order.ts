/**
 * Suppliers and purchase orders, served to admin clients under
 * `stores/:storeRef/suppliers` and `stores/:storeRef/purchase-orders`
 * (contract section 6: docs/superpowers/plans/2026-09-15-inventory-contracts.md
 * in the api repo). Types only.
 *
 * Money and costs are JSON numbers in responses; requests accept a number or
 * a numeric string. Unit costs carry up to 4 decimals.
 */
export const PURCHASE_ORDER_STATUSES = [
  "draft",
  "ordered",
  "partially_received",
  "received",
  "closed",
  "cancelled",
] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export const PAYMENT_TERMS = [
  "none",
  "cash_on_delivery",
  "due_on_receipt",
  "in_advance",
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
] as const;
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];

/** Days after `ordered_at` a net term falls due; null when the term has no due date. */
export function paymentDueDays(terms: PaymentTerms): number | null {
  const match = /^net_(\d+)$/.exec(terms);
  return match ? Number(match[1]) : null;
}

/** `code` values of supplier and purchase order business errors. */
export const PURCHASE_ORDER_ERROR_CODES = {
  /** 404 */
  SUPPLIER_NOT_FOUND: "SUPPLIER_NOT_FOUND",
  /** 409. Another live supplier has this name (case-insensitive). */
  SUPPLIER_NAME_TAKEN: "SUPPLIER_NAME_TAKEN",
  /** 409. An archived supplier cannot be assigned to a PO. */
  SUPPLIER_ARCHIVED: "SUPPLIER_ARCHIVED",
  /** 409. A non-draft PO references the supplier; archive it instead. */
  SUPPLIER_IN_USE: "SUPPLIER_IN_USE",
  /** 404 */
  NOT_FOUND: "PURCHASE_ORDER_NOT_FOUND",
  /** 409. `details: { from, action }`. */
  INVALID_TRANSITION: "PURCHASE_ORDER_INVALID_TRANSITION",
  /** 400. `details.missing: ("supplier" | "destination" | "lines")[]`. */
  INCOMPLETE: "PURCHASE_ORDER_INCOMPLETE",
  /** 409. Only notes and tags change on a received, closed or cancelled PO. */
  READ_ONLY: "PURCHASE_ORDER_READ_ONLY",
  /** 409 */
  DESTINATION_LOCKED: "PURCHASE_ORDER_DESTINATION_LOCKED",
  /** 409. `details.lines: [{ line_id, outstanding, requested }]`. */
  OVER_RECEIPT: "PURCHASE_ORDER_OVER_RECEIPT",
  /** 409. `details.lines: [{ line_id, settled, requested }]`. */
  QUANTITY_BELOW_SETTLED: "PURCHASE_ORDER_QUANTITY_BELOW_SETTLED",
  /** 400 */
  SUPPLIER_EMAIL_MISSING: "PURCHASE_ORDER_SUPPLIER_EMAIL_MISSING",
  /** 409. Ordering or receiving a line whose variant was deleted. `details.line_ids: number[]`. */
  LINE_VARIANT_MISSING: "PURCHASE_ORDER_LINE_VARIANT_MISSING",
  /** 502. The notifier rejected the send (SMTP or queue failure). `details: { po_code, error }`. */
  SEND_FAILED: "PURCHASE_ORDER_SEND_FAILED",
} as const;
export type PurchaseOrderErrorCode =
  (typeof PURCHASE_ORDER_ERROR_CODES)[keyof typeof PURCHASE_ORDER_ERROR_CODES];

export interface Supplier {
  id: number;
  /** 1 to 255 chars. */
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  /** location_areas province code. */
  province: string | null;
  /** location_areas ward code. */
  ward: string | null;
  /** Defaults to "VN". */
  country: string;
  note: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SupplierInput = { name: string } & Partial<
  Omit<Supplier, "id" | "name" | "archived_at" | "created_at" | "updated_at">
>;

export interface PurchaseOrderLineSummary {
  purchase_order_id: number;
  po_code: string;
  status: PurchaseOrderStatus;
  /** Null once the variant has been deleted; the names below are snapshots. */
  variant_id: number | null;
  product_name: string;
  variant_title: string | null;
  qty_ordered: number;
  qty_accepted: number;
  unit_cost: number;
  ordered_at: string | null;
}

/**
 * Identity columns are SNAPSHOTS, exactly as order_items does it:
 * product_name, variant_title and sku are frozen when the line is written, and
 * variant_id/product_id go null if the variant or product is later deleted (a
 * catalog product save may hard-delete a variant). A consumer rendering lines
 * must read the snapshot fields and tolerate a null variant_id: link to the
 * product only when it is non-null, and never re-resolve a name from the
 * catalog.
 */
export interface PurchaseOrderLine {
  id: number;
  /** Null once the variant has been deleted. */
  variant_id: number | null;
  /** Null once the product has been deleted. */
  product_id: number | null;
  /** Snapshot, never null. */
  product_name: string;
  /** Snapshot. */
  variant_title: string | null;
  /** Snapshot of product_variants.seller_sku. */
  sku: string | null;
  /** Read live from the variant; null once it is gone. */
  product_image: string | null;
  supplier_sku: string | null;
  qty_ordered: number;
  qty_accepted: number;
  qty_rejected: number;
  /** ordered - accepted - rejected */
  qty_outstanding: number;
  unit_cost: number;
  /** Percent, 0 to 100, 2 decimals. */
  tax_rate: number;
  /** qty_ordered * unit_cost */
  line_subtotal: number;
  /** line_subtotal * tax_rate / 100 */
  line_tax: number;
}

export interface PurchaseOrderReceipt {
  id: number;
  note: string | null;
  created_at: string;
  created_by: { id: string | null; name: string | null };
  lines: Array<{ line_id: number; accepted: number; rejected: number }>;
}

export interface PurchaseOrder {
  id: number;
  po_number: number;
  /** "PO" + po_number */
  po_code: string;
  status: PurchaseOrderStatus;
  supplier: { id: number; name: string; email: string | null; archived: boolean } | null;
  location: { id: number; name: string } | null;
  reference_number: string | null;
  supplier_note: string | null;
  payment_terms: PaymentTerms;
  /** ordered_at + N days for net_N, else null. */
  payment_due_at: string | null;
  /** Always the store currency in v1. */
  currency_code: string;
  expected_arrival_at: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tags: string[];
  subtotal: number;
  tax_total: number;
  shipping_cost: number;
  other_costs: number;
  total: number;
  /** Sum of qty_ordered. */
  total_items: number;
  ordered_at: string | null;
  /** Set on received, closed or cancelled. */
  closed_at: string | null;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
  lines: PurchaseOrderLine[];
  receipts: PurchaseOrderReceipt[];
}

export type PurchaseOrderListRow = Omit<PurchaseOrder, "lines" | "receipts"> & {
  line_count: number;
  /** Sum of qty_accepted. */
  received_items: number;
};

export interface PurchaseOrderInput {
  supplier_id?: number | null;
  /** v1 sends the default location's id, from `GET /inventory/locations`. */
  location_id?: number | null;
  reference_number?: string | null;
  supplier_note?: string | null;
  /** Defaults to "none". */
  payment_terms?: PaymentTerms;
  expected_arrival_at?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  tags?: string[];
  shipping_cost?: number | string;
  other_costs?: number | string;
  /**
   * Given: replaces the line set. An entry with `id` and NO `variant_id` keeps
   * that line's variant and snapshot as they are, which is the only way to edit
   * a PO carrying a line whose variant was deleted. A new line needs
   * `variant_id`.
   */
  lines?: Array<{
    id?: number;
    variant_id?: number;
    supplier_sku?: string | null;
    qty_ordered: number;
    unit_cost: number | string;
    tax_rate?: number | string;
  }>;
}

export interface ReceivePurchaseOrderRequest {
  lines: Array<{ line_id: number; accepted: number; rejected: number }>;
  note?: string | null;
  idempotency_key?: string | null;
}

export interface SendPurchaseOrderRequest {
  /** Max 2000, prepended to the email. */
  message?: string | null;
}
