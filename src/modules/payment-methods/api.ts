import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type { PaymentMethod } from "./types";

export class PaymentMethodsApi {
  constructor(private http: IHttpClient) {}

  async getEnabled(storeRef: string): Promise<PaymentMethod[]> {
    const res = await this.http.get<PaymentMethod[]>(
      `/public/stores/${storeRef}/payment-methods`
    );
    return unwrap(res);
  }
}
