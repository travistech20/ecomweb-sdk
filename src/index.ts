// Core
export type { IHttpClient, ApiResponse, ApiError, RequestOptions } from "./core/types";
export { ApiClientError, unwrap, unwrapOrNull, ensureSuccess } from "./core/response";

// Schema and contract types
export * from "./types";

// Storage — URL helpers only. Objects are uploaded through the API's asset
// endpoints; there is no storage client here and no Supabase dependency.
export {
  assetBaseUrl,
  buildTransformQuery,
  parseStorageUrl,
  resolveAssetUrl,
  toObjectUrl,
  toRenderUrl,
  fromObjectPublicUrlToRender,
  rewriteSupabaseUrl,
  transformationsEnabled,
  OBJECT_PREFIX,
  RENDER_PREFIX,
  DEFAULT_BUCKET,
} from "./modules/storage/image-transform";
export type {
  ImageTransformOptions,
  ResizeMode,
  ImageFormat,
} from "./modules/storage/types";

// Modules — API classes
export { ProductsApi } from "./modules/products/api";
export { CollectionsApi } from "./modules/collections/api";
export { CategoriesApi } from "./modules/categories/api";
export { CartApi } from "./modules/cart/api";
export { OrdersApi } from "./modules/orders/api";
export { BlogApi } from "./modules/blog/api";
export { StoresApi } from "./modules/stores/api";
export { SearchApi } from "./modules/search/api";
export { BannersApi } from "./modules/banners/api";
export { ShippingApi } from "./modules/shipping/api";
export { PromotionsApi } from "./modules/promotions/api";
export { PaymentMethodsApi } from "./modules/payment-methods/api";
export { PaymentsApi } from "./modules/payments/api";
export { ReviewsApi } from "./modules/reviews/api";
export { CustomersApi } from "./modules/customers/api";
export { AddressesApi } from "./modules/addresses/api";
export { ContentPagesApi } from "./modules/content-pages/api";
export { MenusApi } from "./modules/menus/api";
export { RedirectsApi } from "./modules/redirects/api";
export { AuthApi } from "./modules/auth/api";
export { MemoryTokenStorage } from "./modules/auth/token-storage";
export { createAuthAwareHttpClient } from "./modules/auth/refresh-client";

// Modules — Types
export type {
  ProductDetail,
  ProductQueryParams,
  ProductService,
  PromotionData,
  WithSeoMetadata,
  SeoMetadata,
  Product,
  ProductWithVariants,
  ProductVariant,
  VariantOption,
  VariantOptionValue,
  ProductImage,
  ProductVideo,
} from "./modules/products/types";

export type {
  Collection,
  CollectionQueryParams,
  CollectionSearchCriteria,
} from "./modules/collections/types";

// Smart collection rule vocabulary — the shared field/operator contract.
export type {
  RuleField,
  RuleOperator,
  RuleValueKind,
  RuleOperatorSpec,
  RuleFieldSpec,
  CollectionRule,
  CollectionRuleSet,
  CollectionRuleSetCriteria,
} from "./modules/collections/rule-set";
export {
  COLLECTION_RULE_MATRIX,
  RULE_FIELDS,
  MAX_RULES_PER_SET,
  MAX_RULE_VALUE_ENTRIES,
  isRuleField,
  operatorsForField,
  valueKindFor,
  allowedValuesFor,
} from "./modules/collections/rule-set";

export type { Category, CategoryQueryParams } from "./modules/categories/types";

export type {
  CartApiItem,
  CartApiResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "./modules/cart/types";

export type {
  Order,
  OrderItem,
  OrderWithItems,
  CreateOrderRequest,
  CreateOrderItemRequest,
  CustomerOrderFilter,
  GuestOrderLookupParams,
  GuestOrderLookupResult,
  PaymentMethod as OrderPaymentMethod,
} from "./modules/orders/types";

export type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPostStatus,
  BlogSettings,
  BlogPostQueryParams,
  BlogCategoryQueryParams,
  BlogTagQueryParams,
} from "./modules/blog/types";

export type {
  Store,
  StoreConfig,
  StoreSettings,
  StoreConfigurationInfo,
  ThemeConfig,
  StoreStatus,
} from "./modules/stores/types";

export type {
  ProductSearchParams,
  AutocompleteParams,
  SearchProduct,
  SearchCategory,
  ProductSearchResponse,
  CategorySearchResponse,
  BlogSearchParams,
  BlogSearchResponse,
} from "./modules/search/types";

export type { Banner, BannerQueryParams } from "./modules/banners/types";

export type {
  Province,
  Ward,
  LocationData,
  ShippingCalculationRequest,
  ShippingOption,
} from "./modules/shipping/types";

export type {
  ValidatePromotionCodeRequest,
  ValidatePromotionCodeResponse,
  PromotionSuggestion,
  PromotionSuggestionsResponse,
} from "./modules/promotions/types";

export type {
  PaymentMethod as StorePaymentMethod,
  BankAccount,
} from "./modules/payment-methods/types";

export type {
  InitiatePaymentResult,
  PaymentStateResult,
  PaymentCredentialStatus,
} from "./modules/payments/types";

export type {
  ProductReview,
  ProductReviewWithReplies,
  ProductReviewFilters,
  PaginatedReviewsResponse,
  ReviewInvitationPublicData,
  SubmitReviewInvitationPayload,
  OrderReviewInvitationSummary,
  BatchOrderReviewInvitationsResult,
} from "./modules/reviews/types";

export type {
  Customer,
  UpsertCustomerForAuthPayload,
} from "./modules/customers/types";

export type {
  Address,
  CreateAddressDto,
  UpdateAddressDto,
} from "./modules/addresses/types";

export type { ContentPage } from "./modules/content-pages/types";

export type { StoreMenu, StoreMenuItem } from "./modules/menus/types";

export type { UrlRedirect } from "./modules/redirects/types";

export type {
  AuthResult,
  AuthIdentity,
  AuthTokens,
  CurrentIdentity,
  PasswordPolicy,
  PublicAuthConfig,
  GoogleAuthUrl,
  RegisterPayload,
  LoginPayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
  SentResult,
  VerifiedResult,
  ResetResult,
  ChangedResult,
  AuthErrorCode,
} from "./modules/auth/types";
export type { TokenStorage } from "./modules/auth/token-storage";

// SDK factory
import type { IHttpClient } from "./core/types";
import { ProductsApi } from "./modules/products/api";
import { CollectionsApi } from "./modules/collections/api";
import { CategoriesApi } from "./modules/categories/api";
import { CartApi } from "./modules/cart/api";
import { OrdersApi } from "./modules/orders/api";
import { BlogApi } from "./modules/blog/api";
import { StoresApi } from "./modules/stores/api";
import { SearchApi } from "./modules/search/api";
import { BannersApi } from "./modules/banners/api";
import { ShippingApi } from "./modules/shipping/api";
import { PromotionsApi } from "./modules/promotions/api";
import { PaymentMethodsApi } from "./modules/payment-methods/api";
import { PaymentsApi } from "./modules/payments/api";
import { ReviewsApi } from "./modules/reviews/api";
import { CustomersApi } from "./modules/customers/api";
import { AddressesApi } from "./modules/addresses/api";
import { ContentPagesApi } from "./modules/content-pages/api";
import { MenusApi } from "./modules/menus/api";
import { RedirectsApi } from "./modules/redirects/api";

export interface EcomwebSdkOptions {
  publicHttp: IHttpClient;
  authHttp: IHttpClient;
}

export function createEcomwebSdk(options: EcomwebSdkOptions) {
  const { publicHttp, authHttp } = options;
  return {
    products: new ProductsApi(publicHttp),
    collections: new CollectionsApi(publicHttp),
    categories: new CategoriesApi(publicHttp),
    cart: new CartApi(publicHttp, authHttp),
    orders: new OrdersApi(publicHttp, authHttp),
    blog: new BlogApi(publicHttp, authHttp),
    stores: new StoresApi(publicHttp),
    search: new SearchApi(publicHttp),
    banners: new BannersApi(publicHttp),
    shipping: new ShippingApi(publicHttp),
    promotions: new PromotionsApi(publicHttp),
    paymentMethods: new PaymentMethodsApi(publicHttp),
    payments: new PaymentsApi(publicHttp, authHttp),
    reviews: new ReviewsApi(publicHttp),
    customers: new CustomersApi(authHttp),
    addresses: new AddressesApi(authHttp),
    contentPages: new ContentPagesApi(publicHttp),
    menus: new MenusApi(publicHttp),
    redirects: new RedirectsApi(publicHttp),
  };
}

export type EcomwebSdk = ReturnType<typeof createEcomwebSdk>;
