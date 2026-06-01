import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type { PaginatedResponse } from "../../types";
import type {
  Order,
  OrderWithItems,
  CustomerOrderFilter,
  CreateOrderRequest,
  GuestOrderLookupParams,
  GuestOrderLookupResult,
} from "./types";

export class OrdersApi {
  constructor(
    private publicHttp: IHttpClient,
    private authHttp: IHttpClient
  ) {}

  async lookupGuest(
    storeRef: string,
    params: GuestOrderLookupParams
  ): Promise<GuestOrderLookupResult> {
    const query = stringify({
      order_number: params.order_number,
      customer_email: params.customer_email,
      customer_phone: params.customer_phone,
    });
    const res = await this.publicHttp.get<GuestOrderLookupResult>(
      `/public/stores/${storeRef}/orders/lookup?${query}`
    );
    return unwrap(res);
  }

  async create(
    storeRef: string,
    data: CreateOrderRequest,
    isAuth: boolean
  ): Promise<OrderWithItems> {
    if (isAuth) {
      const res = await this.authHttp.post<OrderWithItems>(
        `/tenant/stores/${storeRef}/customers/orders`,
        data
      );
      return unwrap(res);
    }
    const res = await this.publicHttp.post<OrderWithItems>(
      `/public/stores/${storeRef}/orders`,
      data
    );
    return unwrap(res);
  }

  async listCustomerOrders(
    storeRef: string,
    params: Partial<CustomerOrderFilter> & { page?: number } = {}
  ): Promise<PaginatedResponse<Order>> {
    const limit = params.limit ?? 10;
    const page =
      params.page ??
      (params.offset ? Math.floor((params.offset as number) / limit) + 1 : 1);
    const offset = params.offset ?? (page - 1) * limit;
    const query = stringify({
      search: params.search || undefined,
      status: params.status || undefined,
      limit,
      offset,
      include_items: true,
      sort_by: params.sort_by ?? "created_at",
      sort_order: params.sort_order ?? "desc",
    });
    const res = await this.authHttp.get<PaginatedResponse<Order>>(
      `/tenant/stores/${storeRef}/customers/orders${query ? `?${query}` : ""}`
    );
    return unwrap(res);
  }
}
