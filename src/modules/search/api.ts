import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type {
  ProductSearchParams,
  AutocompleteParams,
  ProductSearchResponse,
  BlogSearchParams,
  BlogSearchResponse,
} from "./types";

export class SearchApi {
  constructor(private http: IHttpClient) {}

  async searchCatalog(
    storeRef: string,
    params: ProductSearchParams
  ): Promise<ProductSearchResponse> {
    const queryString = stringify(params);
    const res = await this.http.get<ProductSearchResponse>(
      `/public/stores/${storeRef}/search/catalog${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }

  async autocompleteCatalog<T>(
    storeRef: string,
    params: AutocompleteParams
  ): Promise<T> {
    const queryString = stringify(params);
    const res = await this.http.get<T>(
      `/public/stores/${storeRef}/search/catalog/autocomplete${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }

  async searchBlog(
    storeRef: string,
    params: BlogSearchParams
  ): Promise<BlogSearchResponse> {
    const queryString = stringify(params);
    const res = await this.http.get<BlogSearchResponse>(
      `/public/stores/${storeRef}/search/blog${queryString ? "?" + queryString : ""}`
    );
    return unwrap(res);
  }
}
