import type { ApiResponse, IHttpClient, RequestOptions } from "../../core/types";
import type {
  AuthResult,
  ChangeEmailPayload,
  ChangePasswordPayload,
  ChangedResult,
  CurrentIdentity,
  GoogleAuthUrl,
  LoginPayload,
  PublicAuthConfig,
  RegisterPayload,
  ResetPasswordPayload,
  ResetResult,
  SentResult,
  VerifiedResult,
  VerifyOtpPayload,
} from "./types";

/**
 * One store's auth surface.
 *
 * Two prefixes, not one: `public/` routes are unauthenticated and throttled,
 * `tenant/` routes require an access token and assert that the token's
 * store_id matches the route's store.
 *
 * This class does not supply `x-storefront-api-key` — StorefrontApiKeyGuard
 * requires it on every route, and the injected IHttpClient owns that header.
 */
export class AuthApi {
  constructor(
    private http: IHttpClient,
    private storeRef: string,
  ) {}

  private publicPath(suffix: string): string {
    return `/public/stores/${encodeURIComponent(this.storeRef)}/auth/${suffix}`;
  }

  private tenantPath(suffix: string): string {
    return `/tenant/stores/${encodeURIComponent(this.storeRef)}/auth/${suffix}`;
  }

  private auth(access_token: string): RequestOptions {
    return { headers: { Authorization: `Bearer ${access_token}` } };
  }

  // ---- unauthenticated -------------------------------------------------

  /** Never returns tokens: a new email and an existing one respond identically. */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(this.publicPath("register"), payload, undefined);
  }

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(this.publicPath("login"), payload, undefined);
  }

  async refresh(refresh_token: string): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(
      this.publicPath("refresh"),
      { refresh_token },
      undefined,
    );
  }

  async verifyEmail(token: string): Promise<ApiResponse<VerifiedResult>> {
    return this.http.post<VerifiedResult>(
      this.publicPath("verify-email"),
      { token },
      undefined,
    );
  }

  async resendVerification(email: string): Promise<ApiResponse<SentResult>> {
    return this.http.post<SentResult>(
      this.publicPath("resend-verification"),
      { email },
      undefined,
    );
  }

  async forgotPassword(email: string): Promise<ApiResponse<SentResult>> {
    return this.http.post<SentResult>(
      this.publicPath("forgot-password"),
      { email },
      undefined,
    );
  }

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse<ResetResult>> {
    return this.http.post<ResetResult>(
      this.publicPath("reset-password"),
      payload,
      undefined,
    );
  }

  async confirmEmailChange(token: string): Promise<ApiResponse<ChangedResult>> {
    return this.http.post<ChangedResult>(
      this.publicPath("change-email/confirm"),
      { token },
      undefined,
    );
  }

  async requestOtp(email: string): Promise<ApiResponse<SentResult>> {
    return this.http.post<SentResult>(
      this.publicPath("otp/request"),
      { email },
      undefined,
    );
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(
      this.publicPath("otp/verify"),
      payload,
      undefined,
    );
  }

  async anonymous(): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(this.publicPath("anonymous"), undefined, undefined);
  }

  async getGoogleUrl(redirect_to = "/"): Promise<ApiResponse<GoogleAuthUrl>> {
    const query = `?redirect_to=${encodeURIComponent(redirect_to)}`;
    return this.http.get<GoogleAuthUrl>(
      `${this.publicPath("google/url")}${query}`,
      undefined,
    );
  }

  async exchangeGoogleCode(code: string): Promise<ApiResponse<AuthResult>> {
    return this.http.post<AuthResult>(
      this.publicPath("google/exchange"),
      { code },
      undefined,
    );
  }

  async getAuthConfig(): Promise<ApiResponse<PublicAuthConfig>> {
    return this.http.get<PublicAuthConfig>(this.publicPath("config"), undefined);
  }

  // ---- access token required -------------------------------------------

  async me(access_token: string): Promise<ApiResponse<CurrentIdentity | null>> {
    return this.http.get<CurrentIdentity | null>(
      this.tenantPath("me"),
      this.auth(access_token),
    );
  }

  /** Revokes one session. The refresh token identifies which. */
  async logout(
    access_token: string,
    refresh_token: string,
  ): Promise<ApiResponse<unknown>> {
    return this.http.post<unknown>(
      this.tenantPath("logout"),
      { refresh_token },
      this.auth(access_token),
    );
  }

  async logoutAll(access_token: string): Promise<ApiResponse<unknown>> {
    return this.http.post<unknown>(
      this.tenantPath("logout-all"),
      undefined,
      this.auth(access_token),
    );
  }

  async changePassword(
    access_token: string,
    payload: ChangePasswordPayload,
  ): Promise<ApiResponse<unknown>> {
    return this.http.post<unknown>(
      this.tenantPath("change-password"),
      payload,
      this.auth(access_token),
    );
  }

  async changeEmail(
    access_token: string,
    payload: ChangeEmailPayload,
  ): Promise<ApiResponse<unknown>> {
    return this.http.post<unknown>(
      this.tenantPath("change-email"),
      payload,
      this.auth(access_token),
    );
  }
}
