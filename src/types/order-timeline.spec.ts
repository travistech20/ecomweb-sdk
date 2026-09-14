import { describe, expect, it } from "vitest";
import {
  ORDER_ACTOR_TYPES,
  ORDER_EVENT_TYPES,
  type OrderTimelineEntry,
} from "./order-timeline";

// Compile-time: `kind` narrows the union. `pnpm typecheck` fails if a
// comment-only field becomes reachable on an event or vice versa, because the
// ts-expect-error directives below would then be unused.
function assertKindNarrows(entry: OrderTimelineEntry) {
  if (entry.kind === "event") {
    void entry.actor.type;
    // @ts-expect-error body exists only on comments
    void entry.body;
  } else {
    void entry.author.id;
    // @ts-expect-error event_type exists only on events
    void entry.event_type;
  }
}
void assertKindNarrows;

describe("order timeline vocabulary", () => {
  // The API pins these same lists in
  // order-event-type-vocabulary.contract.spec.ts. Change both together.
  it("lists the event types the API records", () => {
    expect([...ORDER_EVENT_TYPES]).toEqual([
      "placed",
      "order_status_changed",
      "fulfillment_status_changed",
      "shipping_status_changed",
      "payment_status_changed",
      "tracking_number_updated",
    ]);
  });

  it("lists the actor types the API records", () => {
    expect([...ORDER_ACTOR_TYPES]).toEqual([
      "staff",
      "customer",
      "api_key",
      "gateway",
      "system",
    ]);
  });
});
