import { describe, it, expect } from "vitest";
import {
  SALES_CHANNEL_KINDS,
  SALES_CHANNEL_CODES,
  OWNED_CHANNEL_CODES,
} from "./sales-channel";

describe("sales channel vocabulary", () => {
  it("pins the channel kinds", () => {
    expect([...SALES_CHANNEL_KINDS]).toEqual([
      "owned",
      "feed",
      "marketplace",
      "pos",
    ]);
  });

  it("pins the seeded channel codes", () => {
    expect([...SALES_CHANNEL_CODES]).toEqual(["online_store", "pos"]);
  });

  it("keeps every owned code inside the full vocabulary", () => {
    for (const code of OWNED_CHANNEL_CODES) {
      expect(SALES_CHANNEL_CODES).toContain(code);
    }
  });

  it("treats online_store as an owned channel", () => {
    expect(OWNED_CHANNEL_CODES).toContain("online_store");
  });
});
