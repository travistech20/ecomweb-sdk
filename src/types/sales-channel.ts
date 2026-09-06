/**
 * Sales channel vocabulary.
 *
 * This SDK owns these values; the API pins them with a tripwire spec at
 * src/modules/sales-channels/domain/constants/sales-channel-vocabulary.contract.spec.ts.
 * Changing anything here requires the matching change in the API before
 * merging, or the API will reject a kind the dashboard offers.
 */

import { Id } from "./common";

/** Which machinery a channel drives, not just how it renders. */
export const SALES_CHANNEL_KINDS = [
  "owned",
  "feed",
  "marketplace",
  "pos",
] as const;
export type SalesChannelKind = (typeof SALES_CHANNEL_KINDS)[number];

/** Channels seeded by migration. Adding one is a platform migration. */
export const SALES_CHANNEL_CODES = ["online_store", "pos"] as const;
export type SalesChannelCode = (typeof SALES_CHANNEL_CODES)[number];

/** Channels we render and check out ourselves. */
export const OWNED_CHANNEL_CODES = ["online_store"] as const;

/** What a channel can do. Read before scheduling any sync work. */
export interface SalesChannelCapabilities {
  orders?: boolean;
  inventory?: boolean;
  pricing?: boolean;
}

/** Platform-level channel type. Reference data; merchants never create these. */
export interface SalesChannel {
  id: Id;
  code: SalesChannelCode;
  name: string;
  kind: SalesChannelKind;
  capabilities: SalesChannelCapabilities;
  is_enabled: boolean;
  sort_order: number;
}

/** One merchant's installation of a channel. Shopify calls this a Publication. */
export interface StoreSalesChannel {
  id: Id;
  store_id: Id;
  sales_channel_id: Id;
  sales_channel?: SalesChannel;
  status: "active" | "paused" | "error";
  auto_publish: boolean;
  settings: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A product's presence on one channel. */
export interface ProductPublication {
  product_id: Id;
  store_sales_channel_id: Id;
  /** Live when this is in the past. A future value is a scheduled drop. */
  published_at: string;
  /** False = reachable by direct URL, hidden from listings, search and feeds. */
  is_listed: boolean;
}
