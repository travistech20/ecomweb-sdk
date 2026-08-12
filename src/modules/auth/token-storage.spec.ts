import { describe, expect, it } from "vitest";
import { MemoryTokenStorage } from "./token-storage";

describe("MemoryTokenStorage", () => {
  it("starts empty", async () => {
    await expect(new MemoryTokenStorage().get()).resolves.toBeNull();
  });

  it("round-trips a pair", async () => {
    const storage = new MemoryTokenStorage();
    await storage.set({ access_token: "a", refresh_token: "r" });
    await expect(storage.get()).resolves.toEqual({
      access_token: "a",
      refresh_token: "r",
    });
  });

  it("clears", async () => {
    const storage = new MemoryTokenStorage();
    await storage.set({ access_token: "a", refresh_token: "r" });
    await storage.clear();
    await expect(storage.get()).resolves.toBeNull();
  });

  it("seeds from the constructor", async () => {
    const storage = new MemoryTokenStorage({
      access_token: "a",
      refresh_token: "r",
    });
    await expect(storage.get()).resolves.toEqual({
      access_token: "a",
      refresh_token: "r",
    });
  });
});
