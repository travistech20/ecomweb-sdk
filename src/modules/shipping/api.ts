import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type {
  LocationData,
  ShippingCalculationRequest,
  ShippingOption,
} from "./types";

export class ShippingApi {
  constructor(private http: IHttpClient) {}

  async getLocationData(storeRef: string): Promise<LocationData> {
    const res = await this.http.get<LocationData>(
      `/public/stores/${storeRef}/shipping/locations`
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
