import { z } from "zod";
import { OptionalTimestamp } from "./common";

/**
 * Asset-related schemas based on domain entities
 */

// Enum types
export const AssetOwnerType = {
  USER: "user",
  STORE: "store",
  SYSTEM: "system",
} as const;

export const AssetType = {
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
  AUDIO: "audio",
  OTHER: "other",
} as const;

// Asset categories are now handled via asset_links table
// Legacy: moved to AssetLinkField for clarity
export const AssetLinkField = {
  GALLERY: "gallery",
  FEATURED: "featured",
  LOGO: "logo",
  FAVICON: "favicon",
  THUMBNAIL: "thumbnail",
  BANNER: "banner",
  CONTENT: "content",
  AVATAR: "avatar",
} as const;

export const AssetStatus = {
  ACTIVE: "active",
  PROCESSING: "processing",
  FAILED: "failed",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

export const AssetVisibility = {
  PUBLIC: "public",
  PRIVATE: "private",
  PROTECTED: "protected",
} as const;

export const StorageProvider = {
  SUPABASE: "supabase",
  S3: "s3",
  CLOUDINARY: "cloudinary",
} as const;

// Type exports
export type AssetOwnerType =
  (typeof AssetOwnerType)[keyof typeof AssetOwnerType];
export type AssetType = (typeof AssetType)[keyof typeof AssetType];
export type AssetLinkField =
  (typeof AssetLinkField)[keyof typeof AssetLinkField];
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];
export type AssetVisibility =
  (typeof AssetVisibility)[keyof typeof AssetVisibility];
export type StorageProvider =
  (typeof StorageProvider)[keyof typeof StorageProvider];

// Zod schemas for enums
export const assetOwnerTypeSchema = z.enum(["user", "store", "system"]);
export const assetTypeSchema = z.enum([
  "image",
  "video",
  "document",
  "audio",
  "other",
]);
export const assetLinkFieldSchema = z.enum([
  "gallery",
  "featured",
  "logo",
  "favicon",
  "thumbnail",
  "banner",
  "content",
  "avatar",
]);
export const assetStatusSchema = z.enum([
  "active",
  "processing",
  "failed",
  "archived",
  "deleted",
]);
export const assetVisibilitySchema = z.enum(["public", "private", "protected"]);
export const storageProviderSchema = z.enum(["supabase", "s3", "cloudinary"]);

// Interface for asset thumbnails
export interface AssetThumbnails {
  small?: string;
  medium?: string;
  large?: string;
}

// Zod schema for thumbnails
export const assetThumbnailsSchema = z.object({
  small: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
});

// Interface for asset transformations
export interface AssetTransformations {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

// Zod schema for transformations
export const assetTransformationsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  quality: z.number().min(1).max(100).optional(),
  format: z.string().optional(),
});

// Interface for asset metadata
export interface AssetMetadata {
  alt?: string;
  caption?: string;
  tags?: string[];
  seo_title?: string;
  purpose?: string;
  isPrimary?: boolean;
  [key: string]: any;
}

// Zod schema for metadata
export const assetMetadataSchema = z
  .object({
    alt: z.string().optional(),
    caption: z.string().optional(),
    tags: z.array(z.string()).optional(),
    seo_title: z.string().optional(),
    purpose: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })
  .passthrough(); // Allow additional properties

// Interface for Canva metadata
export interface CanvaAssetInfo {
  id: string;
  name: string;
  type: string;
  tags: string[];
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface CanvaDesignInfo {
  id: string;
  title: string;
  urls: {
    edit_url: string;
    view_url: string;
  };
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface CanvaWorkflowInfo {
  step: string;
  history: Array<{
    step: string;
    timestamp: number;
    canva_id: string;
  }>;
}

export interface CanvaMetadata {
  type?: "asset" | "design" | "export";
  edit_url?: string;
  asset?: CanvaAssetInfo;
  design?: CanvaDesignInfo;
}

// Zod schema for Canva metadata
const canvaThumbnailSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const canvaAssetInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  tags: z.array(z.string()),
  thumbnail: canvaThumbnailSchema.optional(),
});

const canvaDesignInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  urls: z.object({
    edit_url: z.string().url(),
    view_url: z.string().url(),
  }),
  thumbnail: canvaThumbnailSchema.optional(),
});

export const canvaMetadataSchema = z.object({
  type: z.enum(["asset", "design", "export"]).optional(),
  asset: canvaAssetInfoSchema.optional(),
  design: canvaDesignInfoSchema.optional(),
  edit_url: z.string().optional(),
});

// Asset Link interface - Links assets to entities
export interface AssetLink {
  id: bigint;
  asset_id: string;
  entity_type: string;
  entity_id: bigint;
  field: AssetLinkField | string; // Allow custom fields beyond enum
  sort_order: number;
  is_primary: boolean;
  extra: Record<string, any>; // alt/caption overrides, crop, blockId, etc.
  created_by?: string | null;
  created_at: Date;
}

// Extended AssetLink interface with asset relation
export interface AssetLinkWithAsset extends AssetLink {
  asset?: Asset; // Optional populated asset
}

// Main Asset interface
export interface Asset extends OptionalTimestamp {
  id: string;
  owner_type: AssetOwnerType;
  owner_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  storage_provider: StorageProvider;
  storage_bucket: string;
  storage_path: string;
  asset_type: AssetType;
  asset_category?: string;
  public_url?: string;
  cdn_url?: string;
  file_extension?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata: AssetMetadata;
  thumbnails: AssetThumbnails;
  transformations: AssetTransformations;
  blurhash?: string;
  dominant_color?: string;
  status: AssetStatus;
  visibility: AssetVisibility;
  is_approved: boolean;
  moderation_status?: string;
  moderation_notes?: string;
  usage_count: number;
  last_accessed_at?: Date;
  version: number;
  parent_asset_id?: string;
  external_id?: string;
  external_provider?: string;
  external_metadata: CanvaMetadata;
  created_by?: string;
  updated_by?: string;
  deleted_at?: Date;
  deleted_by?: string;
  // Relations
  asset_links?: AssetLink[];
}

// Base schema for AssetLink without asset relation
const baseAssetLinkSchema = z.object({
  id: z.bigint(),
  asset_id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.bigint(),
  field: z.string(), // Can be AssetLinkField or custom
  sort_order: z.number().default(0),
  is_primary: z.boolean().default(false),
  extra: z.record(z.string(), z.any()).default({}),
  created_by: z.string().uuid().nullable().optional(),
  created_at: z.coerce.date(),
});

// Base schema for Asset without asset_links relation
const baseAssetSchema = z.object({
  id: z.string(),
  owner_type: assetOwnerTypeSchema,
  owner_id: z.string(),
  file_name: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  file_size: z.number().int().positive(),
  storage_provider: storageProviderSchema,
  storage_bucket: z.string(),
  storage_path: z.string(),
  asset_type: assetTypeSchema,
  asset_category: z.string().optional(),
  public_url: z.string().url().optional(),
  cdn_url: z.string().url().optional(),
  file_extension: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  metadata: assetMetadataSchema.default({}),
  thumbnails: assetThumbnailsSchema.default({}),
  transformations: assetTransformationsSchema.default({}),
  blurhash: z.string().optional(),
  dominant_color: z.string().optional(),
  status: assetStatusSchema.default("active"),
  visibility: assetVisibilitySchema.default("private"),
  is_approved: z.boolean().default(true),
  moderation_status: z.string().optional(),
  moderation_notes: z.string().optional(),
  usage_count: z.number().int().default(0),
  last_accessed_at: z.coerce.date().optional(),
  version: z.number().int().default(1),
  parent_asset_id: z.string().optional(),
  external_id: z.string().optional(),
  external_provider: z.string().optional(),
  external_metadata: canvaMetadataSchema.default({}),
  created_at: z.coerce.date().optional(),
  created_by: z.string().optional(),
  updated_at: z.coerce.date().optional(),
  updated_by: z.string().optional(),
  deleted_at: z.coerce.date().optional(),
  deleted_by: z.string().optional(),
});

// Define AssetLink schema without asset relation to avoid circular dependency
export const assetLinkSchema = baseAssetLinkSchema;

// Define Asset schema with AssetLink reference
export const assetSchema = baseAssetSchema.extend({
  // Relations
  asset_links: z.array(assetLinkSchema).optional(),
});

// Define extended AssetLink schema with asset relation for when both are needed
export const assetLinkWithAssetSchema = baseAssetLinkSchema.extend({
  asset: assetSchema.optional(),
});

// Input schema for creating assets (omits auto-generated fields)
export const createAssetSchema = assetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  usage_count: true,
  version: true,
});

// Input schema for updating assets
export const updateAssetSchema = assetSchema.partial().omit({
  id: true,
  owner_type: true,
  owner_id: true,
  created_at: true,
  created_by: true,
});

// Query filters schema
export const assetFiltersSchema = z.object({
  owner_type: assetOwnerTypeSchema.optional(),
  owner_id: z.string().optional(),
  asset_type: assetTypeSchema.optional(),
  status: assetStatusSchema.optional(),
  visibility: assetVisibilitySchema.optional(),
  entity_type: z.string().optional(),
  entity_id: z.number().int().optional(),
  entity_field: z.string().optional(),
  is_approved: z.boolean().optional(),
  external_provider: z.string().optional(),
  include_links: z.boolean().optional(),
});

// Asset Link query filters
export const assetLinkFiltersSchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.union([z.bigint(), z.number()]).optional(),
  entity_field: z.string().optional(), // Renamed to match backend
  is_primary: z.boolean().optional(),
});

// Type exports from schemas
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetFilters = z.infer<typeof assetFiltersSchema>;
export type AssetLinkFilters = z.infer<typeof assetLinkFiltersSchema>;

// Input schemas for AssetLink
export const createAssetLinkSchema = assetLinkSchema.omit({
  id: true,
  created_at: true,
});

export const updateAssetLinkSchema = assetLinkSchema.partial().omit({
  id: true,
  asset_id: true,
  created_at: true,
});

// Bulk operations schemas for create_links API
export const createAssetLinksSchema = z.object({
  links: z.array(createAssetLinkSchema),
});

// Response schema for create_links API
export const assetLinksResponseSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      asset_id: z.string(),
      entity_type: z.string(),
      entity_id: z.string(),
      field: z.string(),
      sort_order: z.number(),
      is_primary: z.boolean(),
      extra: z.record(z.string(), z.any()),
      created_by: z.string().nullable().optional(),
      created_at: z.string(),
    }),
  ),
  message: z.string(),
});

export type CreateAssetLinkInput = z.infer<typeof createAssetLinkSchema>;
export type UpdateAssetLinkInput = z.infer<typeof updateAssetLinkSchema>;
export type CreateAssetLinksInput = z.infer<typeof createAssetLinksSchema>;
export type AssetLinksResponse = z.infer<typeof assetLinksResponseSchema>;
