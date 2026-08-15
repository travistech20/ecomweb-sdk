import { describe, expect, it, vi, beforeEach } from "vitest";
import { OrdersApi } from "./api";
import type { IHttpClient } from "../../core/types";

function createHttp() {
  return {
    get: vi.fn().mockResolvedValue({ success: true, data: {} }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn().mockResolvedValue({ success: true, data: {} }),
  } as unknown as IHttpClient & { get: any; delete: any };
}

describe("OrdersApi customer order routes", () => {
  let publicHttp: ReturnType<typeof createHttp>;
  let authHttp: ReturnType<typeof createHttp>;
  let api: OrdersApi;

  beforeEach(() => {
    publicHttp = createHttp();
    authHttp = createHttp();
    api = new OrdersApi(publicHttp, authHttp);
  });

  it("fetches a single customer order from the tenant route", async () => {
    await api.getCustomerOrder("acme", 55);

    expect(authHttp.get).toHaveBeenCalledWith(
      "/tenant/stores/acme/customers/orders/55",
    );
    expect(publicHttp.get).not.toHaveBeenCalled();
  });

  it("cancels through DELETE on the tenant route", async () => {
    await api.cancelCustomerOrder("acme", 55);

    expect(authHttp.delete).toHaveBeenCalledWith(
      "/tenant/stores/acme/customers/orders/55",
    );
  });
});
