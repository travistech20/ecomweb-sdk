import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type { PaginatedResponse } from "../../types";
import type { ContentPage } from "./types";

export class ContentPagesApi {
  constructor(private http: IHttpClient) {}

  async getPublished(
    storeRef: string
  ): Promise<PaginatedResponse<ContentPage>> {
    const res = await this.http.get<PaginatedResponse<ContentPage>>(
      `/public/stores/${storeRef}/content-pages`
    );
    return unwrap(res);
  }

  async getBySlug(
    storeRef: string,
    slug: string,
    query?: { include_seo_metadata?: boolean }
  ): Promise<ContentPage> {
    const queryString = query ? stringify(query) : "";
    const res = await this.http.get<ContentPage>(
      `/public/stores/${storeRef}/content-pages/${encodeURIComponent(slug)}${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }
}
