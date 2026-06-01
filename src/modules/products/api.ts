import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { ProductDetail, ProductQueryParams } from "./types";

export class ProductsApi {
  constructor(private http: IHttpClient) {}

  async getById(
    storeRef: string,
    productId: number,
    query?: ProductQueryParams
  ): Promise<ProductDetail | null> {
    const queryString = stringify(query ?? {});
    const res = await this.http.get<ProductDetail>(
      `/public/stores/${storeRef}/products/${productId}${queryString ? "?" + queryString : ""}`
    );
    return unwrapOrNull(res);
  }

  async getBySlug(
    storeRef: string,
    slug: string,
    query?: ProductQueryParams
  ): Promise<ProductDetail | null> {
    const normalizedSlug = slug.normalize("NFC");
    const encodedSlug = encodeURIComponent(normalizedSlug);
    const queryString = stringify(query ?? {});
    const res = await this.http.get<ProductDetail>(
      `/public/stores/${storeRef}/products/slug/${encodedSlug}${queryString ? "?" + queryString : ""}`
    );
    return unwrapOrNull(res);
  }
}
