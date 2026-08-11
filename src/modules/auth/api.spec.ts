import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthApi } from "./api";
import type { IHttpClient } from "../../core/types";

function createHttp() {
  return {
    get: vi.fn().mockResolvedValue({ success: true, data: {} }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as IHttpClient & { get: any; post: any };
}

describe("AuthApi paths", () => {
  let http: ReturnType<typeof createHttp>;
  let api: AuthApi;

  beforeEach(() => {
    http = createHttp();
    api = new AuthApi(http, "acme");
  });

  it("puts unauthenticated routes under public/", async () => {
    await api.login({ email: "a@b.com", password: "pw" });
    expect(http.post).toHaveBeenCalledWith(
      "/public/stores/acme/auth/login",
      { email: "a@b.com", password: "pw" },
      undefined,
    );
  });

  it("puts token routes under tenant/", async () => {
    await api.me("access-token");
    expect(http.get).toHaveBeenCalledWith("/tenant/stores/acme/auth/me", {
      headers: { Authorization: "Bearer access-token" },
    });
  });

  it("nests the OTP routes", async () => {
    await api.requestOtp("a@b.com");
    expect(http.post).toHaveBeenCalledWith(
      "/public/stores/acme/auth/otp/request",
      { email: "a@b.com" },
      undefined,
    );
  });

  it("nests the email-change confirmation route", async () => {
    await api.confirmEmailChange("tok");
    expect(http.post).toHaveBeenCalledWith(
      "/public/stores/acme/auth/change-email/confirm",
      { token: "tok" },
      undefined,
    );
  });

  it("passes redirect_to as a query param on the Google URL", async () => {
    await api.getGoogleUrl("/account");
    expect(http.get).toHaveBeenCalledWith(
      "/public/stores/acme/auth/google/url?redirect_to=%2Faccount",
      undefined,
    );
  });

  it("encodes storeRef into the path", async () => {
    await new AuthApi(http, "my store").getAuthConfig();
    expect(http.get).toHaveBeenCalledWith(
      "/public/stores/my%20store/auth/config",
      undefined,
    );
  });
});
