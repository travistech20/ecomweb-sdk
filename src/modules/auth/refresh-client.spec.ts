import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthAwareHttpClient } from "./refresh-client";
import { MemoryTokenStorage } from "./token-storage";
import type { IHttpClient } from "../../core/types";
import type { AuthApi } from "./api";

const OK = { success: true, data: { ok: true } };
const UNAUTHORIZED = {
  success: false,
  error: { message: "Unauthorized", statusCode: 401 },
};

function createAuth(overrides: Partial<AuthApi> = {}) {
  return {
    refresh: vi.fn().mockResolvedValue({
      success: true,
      data: {
        access_token: "new-access",
        refresh_token: "new-refresh",
        expires_in: 900,
        identity: null,
      },
    }),
    ...overrides,
  } as unknown as AuthApi & { refresh: any };
}

describe("createAuthAwareHttpClient", () => {
  let inner: IHttpClient & { get: any; post: any };
  let storage: MemoryTokenStorage;

  beforeEach(async () => {
    inner = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as any;
    storage = new MemoryTokenStorage({
      access_token: "old-access",
      refresh_token: "old-refresh",
    });
  });

  it("passes through a successful response untouched", async () => {
    inner.get.mockResolvedValue(OK);
    const auth = createAuth();
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await expect(client.get("/x")).resolves.toEqual(OK);
    expect(auth.refresh).not.toHaveBeenCalled();
  });

  it("refreshes once and retries the original request", async () => {
    inner.get.mockResolvedValueOnce(UNAUTHORIZED).mockResolvedValueOnce(OK);
    const auth = createAuth();
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await expect(client.get("/x")).resolves.toEqual(OK);
    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(auth.refresh).toHaveBeenCalledWith("old-refresh");
    expect(inner.get).toHaveBeenCalledTimes(2);
  });

  it("persists the rotated pair", async () => {
    inner.get.mockResolvedValueOnce(UNAUTHORIZED).mockResolvedValueOnce(OK);
    const client = createAuthAwareHttpClient(inner, { storage, auth: createAuth() });

    await client.get("/x");

    await expect(storage.get()).resolves.toEqual({
      access_token: "new-access",
      refresh_token: "new-refresh",
    });
  });

  it("retries only once — a second 401 propagates", async () => {
    inner.get.mockResolvedValue(UNAUTHORIZED);
    const auth = createAuth();
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await expect(client.get("/x")).resolves.toEqual(UNAUTHORIZED);
    expect(inner.get).toHaveBeenCalledTimes(2);
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it("shares one refresh across concurrent 401s", async () => {
    inner.get.mockImplementation(() => Promise.resolve(UNAUTHORIZED));
    const auth = createAuth();
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await Promise.all([client.get("/a"), client.get("/b"), client.get("/c")]);

    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it("clears storage and propagates the 401 when refresh fails", async () => {
    inner.get.mockResolvedValue(UNAUTHORIZED);
    const auth = createAuth({
      refresh: vi.fn().mockResolvedValue({
        success: false,
        error: { message: "Session expired", statusCode: 401 },
      }),
    } as any);
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await expect(client.get("/x")).resolves.toEqual(UNAUTHORIZED);
    await expect(storage.get()).resolves.toBeNull();
  });

  it("clears storage when refresh throws", async () => {
    inner.get.mockResolvedValue(UNAUTHORIZED);
    const auth = createAuth({
      refresh: vi.fn().mockRejectedValue(new Error("network")),
    } as any);
    const client = createAuthAwareHttpClient(inner, { storage, auth });

    await expect(client.get("/x")).resolves.toEqual(UNAUTHORIZED);
    await expect(storage.get()).resolves.toBeNull();
  });

  it("does not attempt a refresh with no stored refresh token", async () => {
    inner.get.mockResolvedValue(UNAUTHORIZED);
    const auth = createAuth();
    const client = createAuthAwareHttpClient(inner, {
      storage: new MemoryTokenStorage(),
      auth,
    });

    await expect(client.get("/x")).resolves.toEqual(UNAUTHORIZED);
    expect(auth.refresh).not.toHaveBeenCalled();
    expect(inner.get).toHaveBeenCalledTimes(1);
  });

  it("wraps every verb", async () => {
    inner.post.mockResolvedValueOnce(UNAUTHORIZED).mockResolvedValueOnce(OK);
    const client = createAuthAwareHttpClient(inner, { storage, auth: createAuth() });

    await expect(client.post("/x", { a: 1 })).resolves.toEqual(OK);
    expect(inner.post).toHaveBeenCalledTimes(2);
  });
});
