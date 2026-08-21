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
    expect(publicHttp.delete).not.toHaveBeenCalled();
  });
});

describe("OrdersApi guest lookup", () => {
  let publicHttp: ReturnType<typeof createHttp>;
  let api: OrdersApi;

  beforeEach(() => {
    publicHttp = createHttp();
    api = new OrdersApi(publicHttp, createHttp());
  });

  // The order code is the only identifier a customer is ever shown, so it has
  // to reach the wire. Forwarding is hand-written here, which is exactly how a
  // param silently goes missing.
  it("forwards the order code the shopper typed", async () => {
    await api.lookupGuest("acme", {
      order_code: "DH-1042-26",
      customer_email: "a@b.com",
    });

    const [url] = publicHttp.get.mock.calls[0];
    expect(url).toContain("order_code=DH-1042-26");
    expect(url).toContain("customer_email=a%40b.com");
  });

  it("still forwards a legacy numeric order_number", async () => {
    await api.lookupGuest("acme", {
      order_number: 1042,
      customer_phone: "0900000000",
    });

    const [url] = publicHttp.get.mock.calls[0];
    expect(url).toContain("order_number=1042");
  });

  it("hits the public lookup route", async () => {
    await api.lookupGuest("acme", { order_code: "#1042" });

    const [url] = publicHttp.get.mock.calls[0];
    expect(url).toContain("/public/stores/acme/orders/lookup?");
  });
});
