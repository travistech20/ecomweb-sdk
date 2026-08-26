/**
 * Result of starting a gateway charge attempt for an order. The shopper is
 * sent to `redirect_url` to complete payment at the provider.
 */
export interface InitiatePaymentResult {
  payment_id: number;
  redirect_url: string;
}

/**
 * Poll target while a shopper waits on a gateway redirect. Deliberately
 * narrow — payment_status/order_status only, nothing else about the order.
 */
export interface PaymentStateResult {
  payment_status: string;
  order_status: string;
}

/**
 * Admin-side status projection for one provider's configured credentials.
 *
 * TYPES ONLY: this is a status read, never a credential. There is
 * intentionally no exported type anywhere in this module that can carry a
 * plaintext credential (secret keys, API tokens, etc.) — the dashboard's
 * PUT request body is typed inline at its call site instead, so nothing
 * here invites a consumer to expect a credential back from a GET.
 */
export interface PaymentCredentialStatus {
  provider_code: string;
  mode: "sandbox" | "live";
  // Today the API only returns a row when a credential IS configured — an
  // unconfigured provider is simply absent from the list. Typed `boolean`
  // rather than the literal `true` on purpose: narrowing to `true` would
  // bake that current behaviour into the published contract, so the day the
  // API starts returning unconfigured providers every consumer that narrowed
  // on it breaks. It also keeps this aligned with the dashboard's own
  // PaymentCredentialStatus, which types it `boolean`.
  configured: boolean;
  hint: string | null;
  // Wire format is JSON: this crosses HTTP as an ISO string, never a Date
  // instance — matches the dashboard's own (correct) typing.
  updated_at: string | null;
}
