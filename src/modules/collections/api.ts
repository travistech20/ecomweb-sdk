import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap, unwrapOrNull } from "../../core/response";
import type { Collection, CollectionQueryParams } from "./types";
import type { PaginatedResponse } from "../../types";

export class CollectionsApi {
  constructor(private http: IHttpClient) {}

  async getAllPaginated(
    storeRef: string,
    params?: CollectionQueryParams
  ): Promise<PaginatedResponse<Collection>> {
    const queryString = stringify(params ?? {});
    const res = await this.http.get<PaginatedResponse<Collection>>(
      `/public/stores/${storeRef}/collections${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }

  async getAll(storeRef: string, ids?: number[]): Promise<Collection[]> {
    const result = await this.getAllPaginated(storeRef, {
      ids,
      limit: ids && ids.length > 0 ? Math.min(ids.length, 100) : 100,
    });
    return result.data;
  }

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
