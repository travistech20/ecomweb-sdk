import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { Store, StoreConfigurationInfo } from "./types";

export class StoresApi {
  constructor(private http: IHttpClient) {}

  async getById(
    storeRef: string,
    options?: {
      includeConfig?: boolean;
      includeSettings?: boolean;
      includeEmbeddedScripts?: boolean;
    }
  ): Promise<StoreConfigurationInfo | null> {
    const params = new URLSearchParams();
    if (options?.includeConfig ?? true) params.set("include_config", "1");
    if (options?.includeSettings ?? true) params.set("include_settings", "1");
    if (options?.includeEmbeddedScripts ?? true)
      params.set("include_embedded_scripts", "1");
    const qs = params.toString();
    const res = await this.http.get<StoreConfigurationInfo>(
      `/public/stores/${storeRef}${qs ? `?${qs}` : ""}`
    );
    return unwrapOrNull(res);
  }

  async getBySubdomain(subdomain: string): Promise<Store | null> {
    const res = await this.http.get<Store>(
      `/public/stores/exists/subdomain/${subdomain}`
    );
    return unwrapOrNull(res);
  }

  async getByDomain(domain: string): Promise<StoreConfigurationInfo | null> {
    const res = await this.http.get<StoreConfigurationInfo>(
      `/public/stores/domain/${domain}`
    );
    return unwrapOrNull(res);
  }
}
