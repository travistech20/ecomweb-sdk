import type { IHttpClient } from "../../core/types";
import { unwrap, unwrapOrNull } from "../../core/response";
import type {
  CartApiResponse,
  CartApiItem,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "./types";

export class CartApi {
  constructor(
    private publicHttp: IHttpClient,
    private authHttp: IHttpClient
  ) {}

  private client(isAuth: boolean) {
    return isAuth ? this.authHttp : this.publicHttp;
  }

  private basePath(isAuth: boolean) {
    return isAuth ? "stores" : "public/stores";
  }

  async getCart(
    storeRef: string,
    sessionId: string,
    isAuth: boolean
  ): Promise<CartApiResponse | null> {
    const res = await this.client(isAuth).get<CartApiResponse>(
      `/${this.basePath(isAuth)}/${storeRef}/cart`,
      { headers: { "x-session-id": sessionId } }
    );
    return unwrapOrNull(res);
  }

  async addItem(
    storeRef: string,
    data: AddToCartRequest,
    sessionId: string,
    isAuth: boolean
  ): Promise<{ cart_id: string; item: CartApiItem }> {
    const res = await this.client(isAuth).post<{
      cart_id: string;
      item: CartApiItem;
    }>(`/${this.basePath(isAuth)}/${storeRef}/cart/items`, data, {
      headers: { "x-session-id": sessionId },
    });
    return unwrap(res);
  }

  async updateItem(
    storeRef: string,
    itemId: string,
    data: UpdateCartItemRequest,
    sessionId: string,
    isAuth: boolean
  ): Promise<{ cart_id: string; item: CartApiItem | null }> {
    const res = await this.client(isAuth).put<{
      cart_id: string;
      item: CartApiItem | null;
    }>(`/${this.basePath(isAuth)}/${storeRef}/cart/items/${itemId}`, data, {
      headers: { "x-session-id": sessionId },
    });
    return unwrap(res);
  }

  async removeItem(
    storeRef: string,
    itemId: string,
    sessionId: string,
    isAuth: boolean
  ): Promise<{ cartId: string; itemId: string }> {
    const res = await this.client(isAuth).delete<{
      cartId: string;
      itemId: string;
    }>(`/${this.basePath(isAuth)}/${storeRef}/cart/items/${itemId}`, {
      headers: { "x-session-id": sessionId },
    });
    return unwrap(res);
  }

  async clear(
    storeRef: string,
    sessionId: string,
    isAuth: boolean
  ): Promise<{ cart_id: string }> {
    const res = await this.client(isAuth).delete<{ cart_id: string }>(
      `/${this.basePath(isAuth)}/${storeRef}/cart`,
      { headers: { "x-session-id": sessionId } }
    );
    return unwrap(res);
  }

  async merge(storeRef: string, sessionId: string): Promise<CartApiResponse> {
    const res = await this.authHttp.post<CartApiResponse>(
      `/stores/${storeRef}/cart/merge`,
      {},
      { headers: { "x-session-id": sessionId } }
    );
    return unwrap(res);
  }
}
