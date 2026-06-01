import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { Collection } from "./types";

export class CollectionsApi {
  constructor(private http: IHttpClient) {}

  async getBySlug(
    storeRef: string,
    slug: string,
    query?: { include_seo_metadata?: boolean }
  ): Promise<Collection | null> {
    const queryString = query ? stringify(query) : "";
    const res = await this.http.get<Collection>(
      `/public/stores/${storeRef}/collections/slug/${slug}${queryString ? "?" + queryString : ""}`
    );
    return unwrapOrNull(res);
  }
}
