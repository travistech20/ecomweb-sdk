import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type {
  LocationAreaQuery,
  LocationAreasResponse,
  ShippingCalculationRequest,
  ShippingOption,
} from "./types";

export class ShippingApi {
  constructor(private http: IHttpClient) {}

  /**
   * List administrative areas. Pass `level` for one tier or `parent_code`
   * for one area's children; passing neither returns every area, which for
   * Vietnam is 3,355 rows and about 900 KB. Prefer a filter.
   */
  async listLocationAreas(
    storeRef: string,
    query: LocationAreaQuery = {}
  ): Promise<LocationAreasResponse> {
    const params = new URLSearchParams();
    if (query.level !== undefined) params.set("level", String(query.level));
    if (query.parent_code) params.set("parent_code", query.parent_code);
    const qs = params.toString();

    const res = await this.http.get<LocationAreasResponse>(
      `/public/stores/${storeRef}/shipping/locations${qs ? `?${qs}` : ""}`
    );
    return unwrap(res);
  }

  async calculate(
    storeRef: string,
    data: ShippingCalculationRequest
  ): Promise<ShippingOption[]> {
    const res = await this.http.post<ShippingOption[]>(
      `/public/stores/${storeRef}/shipping/calculate`,
      data
    );
    return unwrap(res);
  }
}
