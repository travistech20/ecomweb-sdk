import { describe, expect, it } from "vitest";
import {
  CUSTOMER_ACTOR_TYPES,
  CUSTOMER_DERIVED_EVENT_TYPES,
  CUSTOMER_EVENT_TYPES,
  type CustomerTimelineEntry,
} from "./customer-timeline";

// Compile-time: `kind` narrows the union. `pnpm typecheck` fails if a
// comment-only field becomes reachable on an event or vice versa, because the
// ts-expect-error directives below would then be unused.
function assertKindNarrows(entry: CustomerTimelineEntry) {
  if (entry.kind === "event") {
    void entry.actor.type;
    void entry.source;
    // @ts-expect-error body exists only on comments
    void entry.body;
  } else {
    void entry.author.id;
    // @ts-expect-error event_type exists only on events
    void entry.event_type;
  }
}
void assertKindNarrows;

describe("customer timeline vocabulary", () => {
  // The API pins these same lists in
  // customer-event-type-vocabulary.contract.spec.ts. Change both together.
  it("lists the event types the API records", () => {
    expect([...CUSTOMER_EVENT_TYPES]).toEqual([
      "created",
      "name_changed",
      "phone_changed",
      "status_changed",
      "notes_updated",
      "deleted",
      "identity_linked",
      "duplicates_merged",
      "address_created",
      "address_updated",
      "address_deleted",
      "address_default_changed",
    ]);
  });

  it("lists the derived event types the API synthesises", () => {
    expect([...CUSTOMER_DERIVED_EVENT_TYPES]).toEqual([
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
    ]);
  });

  it("lists the actor types the API records", () => {
    expect([...CUSTOMER_ACTOR_TYPES]).toEqual([
      "staff",
      "customer",
      "api_key",
      "system",
    ]);
  });
});
