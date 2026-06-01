import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type {
  ValidatePromotionCodeRequest,
  ValidatePromotionCodeResponse,
  PromotionSuggestionsResponse,
} from "./types";

export class PromotionsApi {
  constructor(private http: IHttpClient) {}

  async validate(
    storeRef: string,
    data: ValidatePromotionCodeRequest
  ): Promise<ValidatePromotionCodeResponse> {
    const res = await this.http.post<ValidatePromotionCodeResponse>(
      `/public/stores/${storeRef}/promotions/validate`,
      data
    );
    return unwrap(res);
  }

  async getSuggestions(
    storeRef: string,
    subtotal?: number
  ): Promise<PromotionSuggestionsResponse> {
    const params = new URLSearchParams();
    if (subtotal !== undefined) params.append("subtotal", subtotal.toString());
    const res = await this.http.get<PromotionSuggestionsResponse>(
      `/public/stores/${storeRef}/promotions/suggestions?${params.toString()}`
    );
    return unwrap(res);
  }
}
