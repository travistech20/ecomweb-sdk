/**
 * The customer timeline: a merged feed of recorded customer-record history,
 * internal staff comments, and derived activity synthesised from other tables.
 * Served to admin clients by `GET stores/:storeRef/customers/:id/timeline`.
 *
 * This SDK owns the vocabulary; the API pins it with a contract test
 * (customer-event-type-vocabulary.contract.spec.ts) because the API cannot
 * import the SDK. Types only: the dashboard calls the admin routes through its
 * own client.
 */

/**
 * Events written into `customer_events` inside the same transaction as the
 * mutation they record. These carry an exact actor.
 */
export const CUSTOMER_EVENT_TYPES = [
  "created",
  "name_changed",
  "phone_changed",
  "status_changed",
  "notes_updated",
  "deleted",
  "identity_linked",
  "duplicates_merged",
] as const;
export type CustomerEventType = (typeof CUSTOMER_EVENT_TYPES)[number];

/**
 * Activity synthesised at read time by unioning `created_at` columns from
 * other tables. Complete for all history, but has no actor and can only show
 * events that happened to leave a row behind.
 */
export const CUSTOMER_DERIVED_EVENT_TYPES = [
  "customer_created",
  "order_placed",
  "payment_recorded",
  "address_added",
  "account_created",
  "login",
  "review_submitted",
  "invitation_sent",
  "invitation_opened",
  "invitation_submitted",
] as const;
export type CustomerDerivedEventType =
  (typeof CUSTOMER_DERIVED_EVENT_TYPES)[number];

/** No `gateway`: customers are never mutated by a payment provider. */
export const CUSTOMER_ACTOR_TYPES = [
  "staff",
  "customer",
  "api_key",
  "system",
] as const;
export type CustomerActorType = (typeof CUSTOMER_ACTOR_TYPES)[number];

export interface CustomerTimelineActor {
  type: CustomerActorType;
  /** Staff UUID, customer id, or API key id. Null for system and derived rows. */
  id: string | null;
  /** Resolved display name, or null when unknown. */
  name: string | null;
  /** Resolved from the staff member's profile; null when they have none. */
  avatar_url: string | null;
}

export interface CustomerTimelineEvent {
  kind: "event";
  /** Namespaced: `evt_<id>` when recorded, `drv_<source>_<id>` when derived. */
  id: string;
  /**
   * `recorded` rows come from `customer_events` and carry an exact actor.
   * `derived` rows are synthesised at read time. Not rendered as a badge; it
   * exists so the panel's "not a complete audit log" copy stays honest.
   */
  source: "recorded" | "derived";
  event_type: CustomerEventType | CustomerDerivedEventType;
  /**
   * Changed values only, never a whole customer snapshot. `name_changed` and
   * `phone_changed` carry `{ from, to }`; `created` carries `{ source }`;
   * `notes_updated` carries `{ cleared }` and never the note text;
   * `duplicates_merged` carries `{ merged_count, moved_orders, moved_addresses }`.
   */
  arguments: Record<string, unknown> | null;
  reason: string | null;
  actor: CustomerTimelineActor;
  /** ISO 8601. */
  created_at: string;
}

export interface CustomerTimelineCommentAuthor {
  id: string;
  name: string | null;
  email: string | null;
  /** Resolved from the staff member's profile; null when they have none. */
  avatar_url: string | null;
}

export interface CustomerTimelineComment {
  kind: "comment";
  /** Namespaced: `cmt_<id>`. */
  id: string;
  /** Plain text. Never render as HTML. */
  body: string;
  author: CustomerTimelineCommentAuthor;
  edited: boolean;
  /** Computed by the server for the requesting user; do not re-derive from a local clock. */
  can_edit: boolean;
  can_delete: boolean;
  /** ISO 8601. */
  created_at: string;
}

export type CustomerTimelineEntry =
  | CustomerTimelineEvent
  | CustomerTimelineComment;

export interface CustomerTimelineResponse {
  /** Newest first. Ties break events before comments, then id descending. */
  entries: CustomerTimelineEntry[];
  /**
   * Opaque cursor for the next page, or null when the feed is exhausted. Pass
   * it back as the `before` query parameter; do not parse it.
   */
  next_before: string | null;
}

/** What POST, PATCH, and DELETE on a comment return. Refetch the timeline after. */
export interface CustomerCommentMutationResult {
  id: string;
}
