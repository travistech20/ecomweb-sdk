export type ResizeMode = "cover" | "contain" | "inside" | "outside";
export type ImageFormat = "origin" | "avif" | "webp" | "png" | "jpeg";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  resize?: ResizeMode;
  quality?: number; // 1..100, default: 80
  format?: ImageFormat;
}

export interface UploadResult {
  url: string | null;
  error: unknown;
}

export interface MoveTempAssetsResult {
  logoUrl: string | null;
  faviconUrl: string | null;
  error: unknown;
}

// Minimal duck-typed interface matching the Supabase storage client shape
export interface IStorageBucket {
  upload(
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<{ data: { path: string } | null; error: unknown }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
  remove(paths: string[]): Promise<{ error: unknown }>;
  copy(from: string, to: string): Promise<{ error: unknown }>;
  list(
    prefix: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: Array<{ name: string }> | null; error: unknown }>;
}

export interface IStorageClient {
  from(bucket: string): IStorageBucket;
}
