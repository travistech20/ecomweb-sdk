import type { IHttpClient, ApiResponse } from "../../core/types";
import type { Customer, UpsertCustomerForAuthPayload } from "./types";

export class CustomersApi {
  constructor(private http: IHttpClient) {}

  async upsertForAuth(
    storeRef: string,
    payload: UpsertCustomerForAuthPayload
  ): Promise<ApiResponse<Customer>> {
    return this.http.post<Customer>(
      `/stores/${storeRef}/customers/auth/upsert`,
      payload
    );
  }
}
