/** Mirrors AuthTokensResult in customer-auth. Nullable by design: register
 *  returns an empty result so a new email and an existing one look identical. */
export interface AuthResult {
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number;
  identity: AuthIdentity | null;
}

export interface AuthIdentity {
  id: string;
  email: string | null;
  email_verified: boolean;
  is_anonymous: boolean;
}

/** A non-null token pair, once the caller has checked. */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/** Mirrors CurrentIdentityResult. `customer_id` is a stringified bigint.
 *  `name`/`avatar_url`/`phone` come from the linked customer profile and
 *  are `null` for anonymous identities or when no customer is linked. */
export interface CurrentIdentity {
  id: string;
  email: string | null;
  email_verified: boolean;
  is_anonymous: boolean;
  customer_id: string | null;
  linked_providers: string[];
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface PasswordPolicy {
  min_length: number;
  require_number: boolean;
  require_symbol: boolean;
  require_uppercase: boolean;
}

export interface PublicAuthConfig {
  password_enabled: boolean;
  google_enabled: boolean;
  otp_enabled: boolean;
  require_email_verification: boolean;
  password_policy: PasswordPolicy;
}

export interface GoogleAuthUrl {
  url: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  /** Anonymous identity to upgrade in place, so its cart survives signup. */
  anonymous_identity_id?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangeEmailPayload {
  current_password: string;
  new_email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

/** Endpoints that deliberately reveal nothing return one of these. */
export interface SentResult {
  sent: boolean;
}
export interface VerifiedResult {
  verified: boolean;
}
export interface ResetResult {
  reset: boolean;
}
export interface ChangedResult {
  changed: boolean;
}

/** Stable codes from the backend. Frontends branch on these and supply their
 *  own copy — backend messages are English and not shopper-facing. */
export type AuthErrorCode =
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_ACCOUNT_LOCKED"
  | "AUTH_EMAIL_NOT_VERIFIED"
  | "AUTH_METHOD_DISABLED"
  | "AUTH_TOKEN_INVALID"
  | "AUTH_TOKEN_EXPIRED"
  | "AUTH_SESSION_EXPIRED"
  | "AUTH_WEAK_PASSWORD"
  | "AUTH_RATE_LIMITED"
  | "AUTH_STORE_MISMATCH"
  | "AUTH_EMAIL_TAKEN";
