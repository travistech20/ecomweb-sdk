import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { UrlRedirect } from "./types";

export class RedirectsApi {
  constructor(private http: IHttpClient) {}

  async lookup(storeRef: string, path: string): Promise<UrlRedirect | null> {
    const params = new URLSearchParams();
    params.set("path", path);
    const res = await this.http.get<{ data: UrlRedirect | null }>(
      `/public/stores/${storeRef}/url-redirects/lookup?${params.toString()}`
    );
    const result = unwrapOrNull(res);
    return result?.data ?? null;
  }
}
