import type { AuthTokens } from "./types";

/**
 * Where a consumer keeps the token pair.
 *
 * Supplied by the consumer, not chosen by the SDK: the three runtimes the SDK
 * targets (server components, route handlers, browser) each need a different
 * mechanism, and two of the three break under any hardcoded choice.
 */
export interface TokenStorage {
  get(): Promise<AuthTokens | null>;
  set(tokens: AuthTokens): Promise<void>;
  clear(): Promise<void>;
}

/** Process-local. Suitable for tests and for a single server-side request. */
export class MemoryTokenStorage implements TokenStorage {
  private tokens: AuthTokens | null;

  constructor(initial: AuthTokens | null = null) {
    this.tokens = initial;
  }

  async get(): Promise<AuthTokens | null> {
    return this.tokens;
  }

  async set(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
  }

  async clear(): Promise<void> {
    this.tokens = null;
  }
}
