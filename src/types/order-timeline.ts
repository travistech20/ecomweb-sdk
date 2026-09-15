/**
 * The order timeline: status history plus internal staff comments, served to
 * admin clients by `GET stores/:storeRef/orders/:id/timeline`.
 *
 * This SDK owns the vocabulary; the API pins it with a contract test
 * (order-event-type-vocabulary.contract.spec.ts) because the API cannot import
 * the SDK. Types only: the dashboard calls the admin routes through its own
 * client.
 */
export const ORDER_EVENT_TYPES = [
  "placed",
  "order_status_changed",
  "fulfillment_status_changed",
  "shipping_status_changed",
  "payment_status_changed",
  "tracking_number_updated",
] as const;
export type OrderEventType = (typeof ORDER_EVENT_TYPES)[number];

export const ORDER_ACTOR_TYPES = [
  "staff",
  "customer",
  "api_key",
  "gateway",
  "system",
] as const;
export type OrderActorType = (typeof ORDER_ACTOR_TYPES)[number];

export interface OrderTimelineActor {
  type: OrderActorType;
  /** Staff UUID, customer id, or API key id. Null for gateway, system, and guests. */
  id: string | null;
  /** Resolved display name, or null when unknown (a gateway reads `arguments.gateway`). */
  name: string | null;
}

export interface OrderTimelineEvent {
  kind: "event";
  id: string;
  event_type: OrderEventType;
  /**
   * Changed values only. Status and tracking events carry `{ from, to }`;
   * `placed` carries `{ source }`, plus `backfilled: true` for orders that
   * predate history tracking; gateway-attributed events add `gateway`.
   */
  arguments: Record<string, unknown> | null;
  reason: string | null;
  actor: OrderTimelineActor;
  /** ISO 8601. */
  created_at: string;
}

export interface OrderTimelineCommentAuthor {
  id: string;
  name: string | null;
  email: string | null;
  /** Resolved from the staff member's profile; null when they have none. */
  avatar_url: string | null;
}

export interface OrderTimelineComment {
  kind: "comment";
  id: string;
  /** Plain text. Never render as HTML. */
  body: string;
  author: OrderTimelineCommentAuthor;
  edited: boolean;
  /** Computed by the server for the requesting user; do not re-derive from a local clock. */
  can_edit: boolean;
  can_delete: boolean;
  /** ISO 8601. */
  created_at: string;
}

export type OrderTimelineEntry = OrderTimelineEvent | OrderTimelineComment;

export interface OrderTimelineResponse {
  /** Newest first. */
  entries: OrderTimelineEntry[];
  /** True when more than 500 events or 500 comments exist; the oldest are omitted. */
  truncated: boolean;
}

/** What POST, PATCH, and DELETE on a comment return. Refetch the timeline after. */
export interface OrderCommentMutationResult {
  id: string;
}
