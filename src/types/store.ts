import { z } from "zod";
import {
  timestampSchema,
  deletedAtSchema,
  storeStatusSchema,
  uuidSchema,
  urlSchema,
  optionalTimestampSchema,
  idSchema,
  StoreStatus,
} from "./common";
import {
  embeddedScriptSchema,
  type EmbeddedScript,
} from "./embedded-script";
import {
  builderThemeConfigSchema,
  type BuilderThemeConfig,
} from "./storefront-builder";

/**
 * Store-related schemas based on Prisma models
 */
// Store main entity
export const storeSchema = z
  .object({
    id: idSchema,
    user_id: uuidSchema,
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    status: storeStatusSchema.default("pending"),
  })
  .extend(timestampSchema.shape)
  .extend(deletedAtSchema.shape);

// Store configuration for domains
export const storeConfigSchema = z
  .object({
    id: idSchema,
    store_id: idSchema,
    subdomain: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
  })
  .extend(timestampSchema.shape);

// Theme configuration schema (structured builder config with passthrough for legacy keys)
export const themeConfigSchema = builderThemeConfigSchema.optional().nullable();

// Store settings (includes blog fields decorated from blog_settings)
export const storeSettingsSchema = z
  .object({
    id: idSchema,
    store_id: idSchema,
    logo_url: urlSchema,
    favicon_url: urlSchema,
    featured_image: urlSchema,
    tiktok_link: urlSchema,
    shopee_link: urlSchema,
    facebook_link: urlSchema,
    instagram_link: urlSchema,
    google_analytics_key: z.string().optional().nullable(),
    shop_introduction: z.string().optional().nullable(),
    tagline: z.string().optional().nullable(),
    blog_title: z.string().optional().nullable(),
    is_blog_enabled: z.boolean().optional().nullable(),
    currency_code: z
      .string()
      .min(3)
      .max(3)
      .default("VND")
      .optional()
      .nullable(),
    review_requests_enabled: z.boolean().optional().nullable(),
    theme_config: themeConfigSchema,
  })
  .extend(optionalTimestampSchema.shape);

// Create store input
export const createStoreSchema = storeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// Update store input
export const updateStoreSchema = createStoreSchema.partial();

// Create store config input
export const createStoreConfigSchema = storeConfigSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update store config input
export const updateStoreConfigSchema = createStoreConfigSchema.partial().omit({
  store_id: true,
});

// Create store settings input
export const createStoreSettingsSchema = storeSettingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update store settings input
export const updateStoreSettingsSchema = createStoreSettingsSchema
  .partial()
  .omit({
    store_id: true,
  });

// Store with relations
export const storeWithRelationsSchema = storeSchema.extend({
  store_config: storeConfigSchema.optional().nullable(),
  store_settings: storeSettingsSchema.optional().nullable(),
  theme_config: themeConfigSchema,
  embedded_scripts: z.array(embeddedScriptSchema).optional(),
});

// Export types
export type Store = {
  ref: string;
  user_id: string;
  name: string;
  description: string | null;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  embedded_scripts?: EmbeddedScript[];
};
export type ThemeConfig = BuilderThemeConfig | null | undefined;
export type StoreConfig = z.infer<typeof storeConfigSchema>;
export type StoreSettings = z.infer<typeof storeSettingsSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type CreateStoreConfig = z.infer<typeof createStoreConfigSchema>;
export type UpdateStoreConfig = z.infer<typeof updateStoreConfigSchema>;
export type CreateStoreSettings = z.infer<typeof createStoreSettingsSchema>;
export type UpdateStoreSettings = z.infer<typeof updateStoreSettingsSchema>;
export type StoreWithRelations = z.infer<typeof storeWithRelationsSchema>;
