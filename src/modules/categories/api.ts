import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap, unwrapOrNull } from "../../core/response";
import type { Category, CategoryQueryParams } from "./types";
import type { PaginatedResponse } from "../../types";

export class CategoriesApi {
  constructor(private http: IHttpClient) {}

  async getAllPaginated(
    storeRef: string,
    params?: CategoryQueryParams
  ): Promise<PaginatedResponse<Category>> {
    const queryString = stringify(params ?? {});
    const res = await this.http.get<PaginatedResponse<Category>>(
      `/public/stores/${storeRef}/categories${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }

  async getAll(storeRef: string, activeOnly = true): Promise<Category[]> {
    const result = await this.getAllPaginated(storeRef, {
      is_active: activeOnly,
      limit: 1000,
    });
    return result.data;
  }

  async getById(
    storeRef: string,
    categoryId: number
  ): Promise<Category | null> {
    const res = await this.http.get<Category>(
      `/public/stores/${storeRef}/categories/${categoryId}`
    );
    return unwrapOrNull(res);
  }

  async getBySlug(storeRef: string, slug: string): Promise<Category | null> {
    const res = await this.http.get<Category>(
      `/public/stores/${storeRef}/categories/${encodeURIComponent(slug)}`
    );
    return unwrapOrNull(res);
  }
}
