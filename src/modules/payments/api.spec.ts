import { describe, expect, it, vi, beforeEach } from "vitest";
import { PaymentsApi } from "./api";
import type { IHttpClient } from "../../core/types";
import { ApiClientError } from "../../core/response";

function createHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as IHttpClient & {
    get: any;
    post: any;
    put: any;
    patch: any;
    delete: any;
  };
}

describe("PaymentsApi", () => {
  let publicHttp: ReturnType<typeof createHttp>;
  let authHttp: ReturnType<typeof createHttp>;
  let api: PaymentsApi;

  beforeEach(() => {
    publicHttp = createHttp();
    authHttp = createHttp();
    api = new PaymentsApi(publicHttp, authHttp);
  });

  describe("initiate", () => {
    it("POSTs to the initiate path with order_code and provider_code, and unwraps the result", async () => {
      publicHttp.post.mockResolvedValue({
        success: true,
        data: { payment_id: 42, redirect_url: "https://gateway.example/pay/42" },
      });

      const result = await api.initiate("acme", {
        order_code: "ORD-1",
        provider_code: "onepay",
      });

      expect(publicHttp.post).toHaveBeenCalledWith(
        "/public/stores/acme/payments/initiate",
        { order_code: "ORD-1", provider_code: "onepay" },
      );
      expect(result).toEqual({
        payment_id: 42,
        redirect_url: "https://gateway.example/pay/42",
      });
    });

    it("goes through the public HTTP client, not the authenticated one", async () => {
      publicHttp.post.mockResolvedValue({
        success: true,
        data: { payment_id: 1, redirect_url: "https://x" },
      });

      await api.initiate("acme", { order_code: "ORD-1", provider_code: "onepay" });

      expect(publicHttp.post).toHaveBeenCalled();
      expect(authHttp.post).not.toHaveBeenCalled();
    });

    it("URL-encodes storeRef in the path", async () => {
      publicHttp.post.mockResolvedValue({
        success: true,
        data: { payment_id: 1, redirect_url: "https://x" },
      });

      await api.initiate("my store", {
        order_code: "ORD-1",
        provider_code: "onepay",
      });

      expect(publicHttp.post).toHaveBeenCalledWith(
        "/public/stores/my%20store/payments/initiate",
        { order_code: "ORD-1", provider_code: "onepay" },
      );
    });

    it("propagates an API error rather than swallowing it", async () => {
      publicHttp.post.mockResolvedValue({
        success: false,
        error: { message: "order not found", statusCode: 404, error: "ORDER_NOT_FOUND" },
      });

      await expect(
        api.initiate("acme", { order_code: "missing", provider_code: "onepay" }),
      ).rejects.toBeInstanceOf(ApiClientError);
      await expect(
        api.initiate("acme", { order_code: "missing", provider_code: "onepay" }),
      ).rejects.toThrow("order not found");
    });
  });

  describe("getPaymentState", () => {
    it("GETs the payment-state path and unwraps the result", async () => {
      publicHttp.get.mockResolvedValue({
        success: true,
        data: { payment_status: "pending", order_status: "processing" },
      });

      const result = await api.getPaymentState("acme", "ORD-1");

      expect(publicHttp.get).toHaveBeenCalledWith(
        "/public/stores/acme/orders/ORD-1/payment-state",
      );
      expect(result).toEqual({ payment_status: "pending", order_status: "processing" });
    });

    it("goes through the public HTTP client, not the authenticated one", async () => {
      publicHttp.get.mockResolvedValue({
        success: true,
        data: { payment_status: "paid", order_status: "confirmed" },
      });

      await api.getPaymentState("acme", "ORD-1");

      expect(publicHttp.get).toHaveBeenCalled();
      expect(authHttp.get).not.toHaveBeenCalled();
    });

    it("URL-encodes both storeRef and order_code in the path, including a literal #", async () => {
      publicHttp.get.mockResolvedValue({
        success: true,
        data: { payment_status: "pending", order_status: "processing" },
      });

      await api.getPaymentState("my store", "#1001");

      expect(publicHttp.get).toHaveBeenCalledWith(
        "/public/stores/my%20store/orders/%231001/payment-state",
      );
    });

    it("propagates an API error rather than swallowing it", async () => {
      publicHttp.get.mockResolvedValue({
        success: false,
        error: { message: "order not found", statusCode: 404, error: "ORDER_NOT_FOUND" },
      });

      await expect(api.getPaymentState("acme", "missing")).rejects.toBeInstanceOf(
        ApiClientError,
      );
      await expect(api.getPaymentState("acme", "missing")).rejects.toThrow(
        "order not found",
      );
    });
  });
});
