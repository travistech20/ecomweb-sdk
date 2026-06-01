import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type { PaginatedResponse } from "../../types";
import type { Banner, BannerQueryParams } from "./types";

export class BannersApi {
  constructor(private http: IHttpClient) {}

  async getPaginated(
    storeRef: string,
    query?: BannerQueryParams
  ): Promise<PaginatedResponse<Banner>> {
    const queryString = stringify(query ?? {});
    const res = await this.http.get<PaginatedResponse<Banner>>(
      `/public/stores/${storeRef}/banners${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }
}
