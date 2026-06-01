import type { IStorageClient, ImageTransformOptions, UploadResult, MoveTempAssetsResult } from "./types";
import { transformationsEnabled, fromObjectPublicUrlToRender, rewriteSupabaseUrl } from "./image-transform";

const DEFAULT_BUCKET = "public-cdn";

export class StorageApi {
  constructor(private storage: IStorageClient) {}

  // ---------------------------------------------------------------------------
  // URL resolution
  // ---------------------------------------------------------------------------

  /**
   * Resolve any image reference (full URL or bare storage object path) to a URL.
   * When transformations are enabled and the URL is a Supabase object URL, rewrites
   * it to the render/image endpoint.
   */
  resolveTransformedImageUrl(
    imagePathOrUrl: string | null | undefined,
    opts?: ImageTransformOptions,
    bucket: string = DEFAULT_BUCKET
  ): string | null {
    if (!imagePathOrUrl) return null;

    if (/^https?:\/\//i.test(imagePathOrUrl)) {
      return rewriteSupabaseUrl(imagePathOrUrl, opts);
    }

    if (imagePathOrUrl.startsWith("/")) return imagePathOrUrl;

    // Bare storage object name — resolve public URL first
    const { data } = this.storage.from(bucket).getPublicUrl(imagePathOrUrl);
    const publicUrl = data.publicUrl;
    if (transformationsEnabled()) {
      const transformed = fromObjectPublicUrlToRender(publicUrl, opts);
      if (transformed) return transformed;
    }
    return publicUrl;
  }

  resolvePublicUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    const { data } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(imagePath);
    return data.publicUrl;
  }

  // ---------------------------------------------------------------------------
  // Uploads
  // ---------------------------------------------------------------------------

  async uploadProductImage(file: File, storeRef: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/products/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadBlogImage(file: File, storeRef: string): Promise<UploadResult> {
    try {
      const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(fileExt) ? fileExt : "jpg";
      const fileName = `stores/store_${storeRef}/uploads/blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${safeExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadRichTextImage(file: File, storeRef: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 5MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/uploads/rich-text-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadBannerImage(file: File, storeRef: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 5MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/banners/banner-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadCategoryBanner(file: File, storeRef: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 5MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/categories/banner-${Date.now()}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadStoreLogo(file: File, storeRef: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 2MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/branding/logos/logo-${Date.now()}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadTempStoreLogo(file: File, userId: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 2MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `temp/user_${userId}/logo-${Date.now()}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadStoreFavicon(file: File, storeRef: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 1 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 1MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `stores/store_${storeRef}/branding/logos/favicon-${Date.now()}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  async uploadTempStoreFavicon(file: File, userId: string): Promise<UploadResult> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: { message: "File must be an image" } };
    }
    if (file.size > 1 * 1024 * 1024) {
      return { url: null, error: { message: "File size must be less than 1MB" } };
    }
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `temp/user_${userId}/favicon-${Date.now()}.${fileExt}`;
      const { data, error } = await this.storage
        .from(DEFAULT_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (error || !data) return { url: null, error };
      const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  // ---------------------------------------------------------------------------
  // Deletes
  // ---------------------------------------------------------------------------

  private extractPath(pathOrUrl: string): string {
    if (pathOrUrl.includes("public-cdn")) {
      const parts = pathOrUrl.split("public-cdn/");
      if (parts.length > 1) return parts[1];
    }
    return pathOrUrl;
  }

  async deleteFile(pathOrUrl: string): Promise<{ error: unknown }> {
    try {
      const filePath = this.extractPath(pathOrUrl);
      const { error } = await this.storage.from(DEFAULT_BUCKET).remove([filePath]);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async deleteProductImage(path: string) { return this.deleteFile(path); }
  async deleteBannerImage(path: string) { return this.deleteFile(path); }
  async deleteCategoryBanner(path: string) { return this.deleteFile(path); }
  async deleteStoreLogo(path: string) { return this.deleteFile(path); }
  async deleteStoreFavicon(path: string) { return this.deleteFile(path); }

  // ---------------------------------------------------------------------------
  // Move temp assets
  // ---------------------------------------------------------------------------

  async moveTempStoreAssets(userId: string, storeRef: string): Promise<MoveTempAssetsResult> {
    try {
      let logoUrl: string | null = null;
      let faviconUrl: string | null = null;

      const { data: files, error: listError } = await this.storage
        .from(DEFAULT_BUCKET)
        .list(`temp/user_${userId}`, { limit: 100, offset: 0 });

      if (listError) return { logoUrl: null, faviconUrl: null, error: listError };
      if (!files || files.length === 0) return { logoUrl: null, faviconUrl: null, error: null };

      for (const file of files) {
        const tempPath = `temp/user_${userId}/${file.name}`;
        let newPath = "";

        if (file.name.startsWith("logo-")) {
          newPath = `stores/store_${storeRef}/branding/logos/${file.name}`;
        } else if (file.name.startsWith("favicon-")) {
          newPath = `stores/store_${storeRef}/branding/logos/${file.name}`;
        }

        if (!newPath) continue;

        const { error: copyError } = await this.storage.from(DEFAULT_BUCKET).copy(tempPath, newPath);
        if (copyError) continue;

        const { data: { publicUrl } } = this.storage.from(DEFAULT_BUCKET).getPublicUrl(newPath);
        if (file.name.startsWith("logo-")) logoUrl = publicUrl;
        else if (file.name.startsWith("favicon-")) faviconUrl = publicUrl;

        await this.storage.from(DEFAULT_BUCKET).remove([tempPath]);
      }

      return { logoUrl, faviconUrl, error: null };
    } catch (error) {
      return { logoUrl: null, faviconUrl: null, error };
    }
  }
}
