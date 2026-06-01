import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { StoreMenu } from "./types";

export class MenusApi {
  constructor(private http: IHttpClient) {}

  async getByRef(
    storeRef: string,
    ref: string,
    includeItems = true
  ): Promise<StoreMenu | null> {
    const query = includeItems ? "?include_items=true" : "";
    const res = await this.http.get<StoreMenu>(
      `/public/stores/${storeRef}/menus/ref/${encodeURIComponent(ref)}${query}`
    );
    return unwrapOrNull(res);
  }
}
