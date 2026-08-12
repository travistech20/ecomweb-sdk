import type { ApiResponse, IHttpClient, RequestOptions } from "../../core/types";
import type { AuthApi } from "./api";
import type { TokenStorage } from "./token-storage";

interface Options {
  storage: TokenStorage;
  auth: AuthApi;
}

/**
 * Wraps an IHttpClient so a 401 triggers one refresh and one retry.
 *
 * The single-flight promise is the point of the whole file. Without it, a page
 * that fires five requests behind an expired access token performs five
 * refreshes; the first rotates and revokes the refresh token, and the other
 * four present a token that no longer exists — logging the user out on load.
 */
export function createAuthAwareHttpClient(
  inner: IHttpClient,
  { storage, auth }: Options,
): IHttpClient {
  let inFlight: Promise<boolean> | null = null;

  /** Resolves true when storage holds a freshly rotated pair. */
  async function refreshOnce(): Promise<boolean> {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      try {
        const current = await storage.get();

        // No refresh token means there is nothing to rotate. Clearing here
        // would be wrong: there may be no session at all, and clear() on an
        // empty store is a no-op that hides the distinction.
        if (!current?.refresh_token) return false;

        const response = await auth.refresh(current.refresh_token);
        const data = response.success ? response.data : null;

        if (!data?.access_token || !data.refresh_token) {
          await storage.clear();
          return false;
        }

        await storage.set({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        return true;
      } catch {
        // A network failure mid-refresh leaves the stored pair in an unknown
        // state. Clearing is the safe read: the caller re-authenticates.
        await storage.clear();
        return false;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  }

  async function withRetry<T>(
    send: () => Promise<ApiResponse<T>>,
  ): Promise<ApiResponse<T>> {
    const first = await send();

    if (first.success || first.error?.statusCode !== 401) return first;

    const refreshed = await refreshOnce();

    if (!refreshed) return first;

    // Exactly one retry. A second 401 means the new token is also rejected,
    // which refreshing again cannot fix.
    return send();
  }

  return {
    get: <T>(url: string, options?: RequestOptions) =>
      withRetry<T>(() => inner.get<T>(url, options)),
    post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
      withRetry<T>(() => inner.post<T>(url, data, options)),
    put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
      withRetry<T>(() => inner.put<T>(url, data, options)),
    patch: <T>(url: string, data?: unknown, options?: RequestOptions) =>
      withRetry<T>(() => inner.patch<T>(url, data, options)),
    delete: <T>(url: string, options?: RequestOptions) =>
      withRetry<T>(() => inner.delete<T>(url, options)),
  };
}
