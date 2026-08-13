import type { ImageTransformOptions } from "./types";

/**
 * Storage URL helpers.
 *
 * Object URLs are plain strings, so no storage client is required — these only
 * ever concatenated base + bucket + path. URLs are built against
 * NEXT_PUBLIC_ASSET_BASE_URL (or ASSET_BASE_URL on the server), which points at
 * the API that serves `/storage/v1/...`.
 *
 * A stored URL's ORIGIN is deliberately ignored and rebuilt: rows written
 * before the storage migration carry whatever host was configured at the time,
 * and those hosts no longer serve anything. Rebuilding is what lets old and new
 * rows resolve identically with no database backfill.
 */

export const OBJECT_PREFIX = "/storage/v1/object/public/";
export const RENDER_PREFIX = "/storage/v1/render/image/public/";

export const DEFAULT_BUCKET = "public-cdn";

function getEnv(key: string): string | undefined {
  if (typeof window === "undefined") {
    return process.env[key];
  }
  return (
    (window as unknown as Record<string, any>)?.process?.env?.[key] ?? undefined
  );
}

/**
 * Origin serving storage objects. Callers in a bundler that inlines
 * `process.env.NEXT_PUBLIC_*` should pass the value explicitly to the
 * `baseUrl` parameters below rather than relying on this lookup, since a
 * dynamic `process.env[key]` read is not inlined.
 */
export function assetBaseUrl(): string {
  return (
    getEnv("NEXT_PUBLIC_ASSET_BASE_URL") ||
    getEnv("ASSET_BASE_URL") ||
    ""
  ).replace(/\/$/, "");
}

export function transformationsEnabled(): boolean {
  const flag = getEnv("NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMATIONS");
  if (typeof flag === "string" && flag !== "") {
    return ["1", "true", "yes", "on"].includes(flag.toLowerCase());
  }
  // Local stacks may not run the image renderer, so serve originals.
  return !/localhost|127\.0\.0\.1/.test(assetBaseUrl());
}

export function buildTransformQuery(opts?: ImageTransformOptions): string {
  if (!opts) return "";
  const params = new URLSearchParams();
  if (opts.width && Number.isFinite(opts.width))
    params.set("width", String(opts.width));
  if (opts.height && Number.isFinite(opts.height))
    params.set("height", String(opts.height));
  if (opts.resize) params.set("resize", opts.resize);
  if (opts.quality && Number.isFinite(opts.quality))
    params.set("quality", String(opts.quality));
  if (opts.format) params.set("format", opts.format);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function toRenderUrl(
  baseUrl: string,
  bucket: string,
  path: string,
  opts?: ImageTransformOptions
): string {
  const query = buildTransformQuery({ resize: "cover", quality: 80, ...opts });
  const normalizedPath = path.replace(/^\//, "");
  return `${baseUrl.replace(/\/$/, "")}${RENDER_PREFIX}${bucket}/${normalizedPath}${query}`;
}

export function toObjectUrl(
  baseUrl: string,
  bucket: string,
  path: string
): string {
  const normalizedPath = path.replace(/^\//, "");
  return `${baseUrl.replace(/\/$/, "")}${OBJECT_PREFIX}${bucket}/${normalizedPath}`;
}

/**
 * Pull bucket + object path out of a storage URL, whatever host it names.
 * Accepts both the object and render path shapes. Returns null for URLs that
 * are not storage URLs at all.
 */
export function parseStorageUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const { pathname } = new URL(url);
    const prefix = [OBJECT_PREFIX, RENDER_PREFIX].find((p) =>
      pathname.includes(p)
    );
    if (!prefix) return null;

    const parts = pathname.split(prefix)[1].split("/");
    const bucket = parts.shift();
    if (!bucket || parts.length === 0) return null;

    return { bucket, path: parts.join("/") };
  } catch {
    return null;
  }
}

/**
 * Rewrite a storage object URL to the render endpoint, rebuilding it against
 * `baseUrl` (defaulting to the configured asset origin). Returns the URL
 * unchanged when it is not a storage URL, when transformations are disabled,
 * or when no base URL is configured.
 */
export function fromObjectPublicUrlToRender(
  publicUrl: string,
  opts?: ImageTransformOptions,
  baseUrl: string = assetBaseUrl()
): string | null {
  const parsed = parseStorageUrl(publicUrl);
  if (!parsed || !baseUrl) return null;
  return toRenderUrl(baseUrl, parsed.bucket, parsed.path, opts);
}

/**
 * Resolve any image reference — a full URL or a bare storage object path — to
 * a URL served by the configured asset origin.
 *
 * - A full http(s) URL that is not a storage URL is returned as-is.
 * - A storage URL is rebuilt against `baseUrl`, ignoring its stored host.
 * - A bare object path is resolved within `bucket`.
 */
export function resolveAssetUrl(
  imagePathOrUrl: string | null | undefined,
  opts?: ImageTransformOptions,
  bucket: string = DEFAULT_BUCKET,
  baseUrl: string = assetBaseUrl()
): string | null {
  if (!imagePathOrUrl) return null;

  const build = (b: string, p: string) =>
    transformationsEnabled()
      ? toRenderUrl(baseUrl, b, p, opts)
      : toObjectUrl(baseUrl, b, p);

  if (/^https?:\/\//i.test(imagePathOrUrl)) {
    const parsed = parseStorageUrl(imagePathOrUrl);
    if (!parsed) return imagePathOrUrl;
    return baseUrl ? build(parsed.bucket, parsed.path) : imagePathOrUrl;
  }

  // Starts with / -> a local app asset, not storage. Leave untouched.
  if (imagePathOrUrl.startsWith("/")) return imagePathOrUrl;

  return baseUrl ? build(bucket, imagePathOrUrl) : null;
}

/**
 * @deprecated Renamed to {@link resolveAssetUrl}. The old name described a
 * Supabase-specific rewrite; the implementation is no longer Supabase-aware.
 * Kept so existing callers keep compiling.
 */
export function rewriteSupabaseUrl(
  url: string,
  opts?: ImageTransformOptions
): string {
  return resolveAssetUrl(url, opts) ?? url;
}
