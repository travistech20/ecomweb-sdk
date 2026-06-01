import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap } from "../../core/response";
import type {
  PaginatedReviewsResponse,
  ProductReviewFilters,
  ReviewInvitationPublicData,
  SubmitReviewInvitationPayload,
  OrderReviewInvitationSummary,
  BatchOrderReviewInvitationsResult,
} from "./types";

export class ReviewsApi {
  constructor(private http: IHttpClient) {}

  async getProductReviews(
    storeRef: string,
    productId: string | number,
    query?: Omit<ProductReviewFilters, "product_id">
  ): Promise<PaginatedReviewsResponse> {
    const queryString = stringify(query ?? {});
    const res = await this.http.get<PaginatedReviewsResponse>(
      `public/stores/${storeRef}/products/${productId}/reviews${queryString ? `?${queryString}` : ""}`
    );
    return unwrap(res);
  }

  async getReviewInvitation(
    storeRef: string,
    token: string
  ): Promise<ReviewInvitationPublicData> {
    const res = await this.http.get<ReviewInvitationPublicData>(
      `public/stores/${storeRef}/review-invitations/${token}`
    );
    return unwrap(res);
  }

  async getOrderReviewInvitations(
    storeRef: string,
    orderNumber: number | string,
    email: string
  ): Promise<OrderReviewInvitationSummary[]> {
    const queryString = stringify({ order_number: orderNumber, email });
    const res = await this.http.get<OrderReviewInvitationSummary[]>(
      `public/stores/${storeRef}/review-invitations/by-order?${queryString}`
    );
    return unwrap(res);
  }

  async getBatchOrderReviewInvitations(
    storeRef: string,
    orderNumbers: (number | string)[],
    email: string
  ): Promise<BatchOrderReviewInvitationsResult> {
    const queryString = stringify({ order_numbers: orderNumbers.join(","), email });
    const res = await this.http.get<BatchOrderReviewInvitationsResult>(
      `public/stores/${storeRef}/review-invitations/by-orders?${queryString}`
    );
    return unwrap(res);
  }

  async submitReviewInvitation(
    storeRef: string,
    token: string,
    payload: SubmitReviewInvitationPayload
  ): Promise<any> {
    const res = await this.http.post(
      `public/stores/${storeRef}/review-invitations/${token}/submit`,
      payload
    );
    return unwrap(res);
  }
}
