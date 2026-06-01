import type { ImageTransformOptions } from "./types";

function getEnv(key: string): string | undefined {
  if (typeof window === "undefined") {
    return process.env[key];
  }
  return (window as unknown as Record<string, any>)?.process?.env?.[key] ?? undefined;
}

function isLocalSupabase(): boolean {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL") || "";
  return /localhost|127\.0\.0\.1/.test(url);
}

export function transformationsEnabled(): boolean {
  const flag = getEnv("NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMATIONS");
  if (typeof flag === "string") {
    return ["1", "true", "yes", "on"].includes(flag.toLowerCase());
  }
  return !isLocalSupabase();
}

export function buildTransformQuery(opts?: ImageTransformOptions): string {
  if (!opts) return "";
  const params = new URLSearchParams();
  if (opts.width && Number.isFinite(opts.width)) params.set("width", String(opts.width));
  if (opts.height && Number.isFinite(opts.height)) params.set("height", String(opts.height));
  if (opts.resize) params.set("resize", opts.resize);
  if (opts.quality && Number.isFinite(opts.quality)) params.set("quality", String(opts.quality));
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
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/render/image/public/${bucket}/${normalizedPath}${query}`;
}

export function fromObjectPublicUrlToRender(
  publicUrl: string,
  opts?: ImageTransformOptions
): string | null {
  try {
    const urlObj = new URL(publicUrl);
    const idx = urlObj.pathname.indexOf("/storage/v1/object/public/");
    if (idx === -1) return null;
    const parts = urlObj.pathname.split("/storage/v1/object/public/")[1].split("/");
    const bucket = parts.shift();
    if (!bucket) return null;
    const objectPath = parts.join("/");
    const base = `${urlObj.protocol}//${urlObj.host}`;
    return toRenderUrl(base, bucket, objectPath, opts);
  } catch {
    return null;
  }
}

/**
 * Rewrite a full Supabase object/public URL to the render/image endpoint.
 * Returns the URL unchanged if it is not a Supabase storage URL, or if
 * transformations are disabled.
 *
 * Does NOT handle bare storage object paths — use StorageApi.resolveUrl for that.
 */
export function rewriteSupabaseUrl(
  url: string,
  opts?: ImageTransformOptions
): string {
  if (transformationsEnabled() && url.includes("/storage/v1/object/public/")) {
    const transformed = fromObjectPublicUrlToRender(url, opts);
    if (transformed) return transformed;
  }
  return url;
}
