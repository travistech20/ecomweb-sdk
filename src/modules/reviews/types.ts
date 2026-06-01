import type {
  PaginatedResponse,
  BaseQueryParams,
  ProductReview as SharedProductReview,
  ProductReviewWithReplies as SharedProductReviewWithReplies,
  ProductReviewFilters as SharedProductReviewFilters,
} from "../../types";

export type ProductReview = SharedProductReview;
export type ProductReviewWithReplies = SharedProductReviewWithReplies;

export type ProductReviewFilters = Omit<
  SharedProductReviewFilters,
  "product_id"
> &
  BaseQueryParams & {
    product_id?: string | number;
  };

export interface PaginatedReviewsResponse
  extends PaginatedResponse<ProductReviewWithReplies> {}

export interface ReviewInvitationPublicData {
  token: string;
  product_name: string;
  variant_name: string | null;
  order_number: string;
  customer_name: string;
  status: string;
  expires_at: string;
}

export interface SubmitReviewInvitationPayload {
  rating: number;
  content: string;
  title?: string;
  pros?: string[];
  cons?: string[];
}

export interface OrderReviewInvitationSummary {
  token: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  status: string;
}

export interface BatchOrderReviewInvitationsResult {
  [order_number: string]: OrderReviewInvitationSummary[];
}
