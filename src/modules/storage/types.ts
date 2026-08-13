export type ResizeMode = "cover" | "contain" | "inside" | "outside";
export type ImageFormat = "origin" | "avif" | "webp" | "png" | "jpeg";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  resize?: ResizeMode;
  quality?: number; // 1..100, default: 80
  format?: ImageFormat;
}
