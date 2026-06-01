import { z } from "zod";

/**
 * Storefront Builder schemas
 *
 * Elementor-style widget system with:
 * - Widget registry (metadata, defaults, categories)
 * - Content/Style split per section
 * - Inline banner items (no separate DB table)
 */

// ─── Section Types ──────────────────────────────────────────────

export const sectionTypeSchema = z.enum([
  "hero_banner",
  "category_grid",
  "featured_products",
  "text_with_image",
  "rich_text",
  "newsletter_signup",
]);

export type SectionType = z.infer<typeof sectionTypeSchema>;

// ─── Section Style (shared by ALL widgets) ──────────────────────

export const sectionStyleSchema = z.object({
  background_color: z.string().optional(),
  text_color: z.string().optional(),
  padding_top: z.string().optional(),
  padding_right: z.string().optional(),
  padding_bottom: z.string().optional(),
  padding_left: z.string().optional(),
  margin_top: z.string().optional(),
  margin_right: z.string().optional(),
  margin_bottom: z.string().optional(),
  margin_left: z.string().optional(),
  text_align: z.enum(["left", "center", "right", "justify"]).optional(),
  max_width: z.enum(["full", "xl", "lg", "md"]).optional(),
});

export type SectionStyle = z.infer<typeof sectionStyleSchema>;

// ─── Hero Banner Item (inline JSON, not DB) ─────────────────────

export const heroBannerItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image_url: z.string().min(1),
  link_url: z.string().optional(),
  button_text: z.string().optional(),
});

export type HeroBannerItem = z.infer<typeof heroBannerItemSchema>;

// ─── Per-Widget Content Schemas ─────────────────────────────────

export const heroBannerConfigSchema = z.object({
  banners: z.array(heroBannerItemSchema).default([]),
  autoplay: z.boolean().default(true),
  autoplay_interval: z.number().min(1000).max(30000).default(5000),
});

export const categoryGridConfigSchema = z.object({
  category_ids: z.array(z.number()).default([]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6)]).default(4),
  show_names: z.boolean().default(true),
  show_count: z.boolean().default(false),
  title: z.string().optional(),
});

export const featuredProductsConfigSchema = z.object({
  collection_slug: z.string().optional(),
  product_ids: z.array(z.number()).optional(),
  limit: z.number().min(1).max(48).default(12),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6)]).default(4),
  title: z.string().optional(),
});

export const textWithImageConfigSchema = z.object({
  content: z.string().default(""),
  image_url: z.string().default(""),
  image_position: z.enum(["left", "right"]).default("right"),
});

export const richTextConfigSchema = z.object({
  content: z.string().default(""),
});

export const newsletterSignupConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
});

// ─── Section Config Union ───────────────────────────────────────

export const sectionConfigSchema = z.union([
  heroBannerConfigSchema,
  categoryGridConfigSchema,
  featuredProductsConfigSchema,
  textWithImageConfigSchema,
  richTextConfigSchema,
  newsletterSignupConfigSchema,
]);

// ─── Section Wrapper (Content + Style) ──────────────────────────

export const builderSectionSchema = z.object({
  id: z.string(),
  type: sectionTypeSchema,
  title: z.string().optional(),
  is_visible: z.boolean().default(true),
  content: z.record(z.string(), z.any()).default({}),
  style: sectionStyleSchema.default({}),
});

export type BuilderSection = z.infer<typeof builderSectionSchema>;

// ─── Typed Content Configs ──────────────────────────────────────

export type HeroBannerConfig = z.infer<typeof heroBannerConfigSchema>;
export type CategoryGridConfig = z.infer<typeof categoryGridConfigSchema>;
export type FeaturedProductsConfig = z.infer<typeof featuredProductsConfigSchema>;
export type TextWithImageConfig = z.infer<typeof textWithImageConfigSchema>;
export type RichTextConfig = z.infer<typeof richTextConfigSchema>;
export type NewsletterSignupConfig = z.infer<
  typeof newsletterSignupConfigSchema
>;

// Map section type to its content type
export type SectionConfigMap = {
  hero_banner: HeroBannerConfig;
  category_grid: CategoryGridConfig;
  featured_products: FeaturedProductsConfig;
  text_with_image: TextWithImageConfig;
  rich_text: RichTextConfig;
  newsletter_signup: NewsletterSignupConfig;
};

// ─── Widget Registry ────────────────────────────────────────────

export type WidgetCategory = "media" | "content" | "commerce" | "engagement";

export interface WidgetDefinition {
  type: SectionType;
  name: string;
  icon: string;
  description: string;
  category: WidgetCategory;
  defaultContent: Record<string, any>;
  defaultStyle: SectionStyle;
}

export const WIDGET_REGISTRY: Record<SectionType, WidgetDefinition> = {
  hero_banner: {
    type: "hero_banner",
    name: "section_types.hero_banner",
    icon: "Image",
    description: "type_descriptions.hero_banner",
    category: "media",
    defaultContent: { banners: [], autoplay: true, autoplay_interval: 5000 },
    defaultStyle: { padding_top: "0", padding_bottom: "0" },
  },
  category_grid: {
    type: "category_grid",
    name: "section_types.category_grid",
    icon: "Grid3X3",
    description: "type_descriptions.category_grid",
    category: "commerce",
    defaultContent: { category_ids: [], columns: 4, show_names: true, show_count: false, title: "" },
    defaultStyle: { padding_top: "2rem", padding_bottom: "2rem" },
  },
  featured_products: {
    type: "featured_products",
    name: "section_types.featured_products",
    icon: "Package",
    description: "type_descriptions.featured_products",
    category: "commerce",
    defaultContent: { collection_slug: "", limit: 12, columns: 4, title: "" },
    defaultStyle: { padding_top: "2rem", padding_bottom: "2rem" },
  },
  text_with_image: {
    type: "text_with_image",
    name: "section_types.text_with_image",
    icon: "LayoutList",
    description: "type_descriptions.text_with_image",
    category: "content",
    defaultContent: { content: "", image_url: "", image_position: "right" },
    defaultStyle: { padding_top: "2rem", padding_bottom: "2rem" },
  },
  rich_text: {
    type: "rich_text",
    name: "section_types.rich_text",
    icon: "Type",
    description: "type_descriptions.rich_text",
    category: "content",
    defaultContent: { content: "" },
    defaultStyle: { padding_top: "2rem", padding_bottom: "2rem", max_width: "lg" },
  },
  newsletter_signup: {
    type: "newsletter_signup",
    name: "section_types.newsletter_signup",
    icon: "Mail",
    description: "type_descriptions.newsletter_signup",
    category: "engagement",
    defaultContent: { title: "", description: "", button_text: "" },
    defaultStyle: { padding_top: "2rem", padding_bottom: "2rem", max_width: "lg" },
  },
};

// ─── Header Config ──────────────────────────────────────────────

export const headerConfigSchema = z.object({
  show_logo: z.boolean().default(true),
  show_search: z.boolean().default(true),
  show_cart: z.boolean().default(true),
  show_auth: z.boolean().default(true),
  main_menu_ref: z.string().optional(),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
  // Topbar (announcement bar above header)
  topbar_message: z.string().optional(),
  topbar_container_class: z.string().optional(),
});

export type HeaderConfig = z.infer<typeof headerConfigSchema>;

// ─── Footer Config ──────────────────────────────────────────────

export const footerConfigSchema = z.object({
  show_logo: z.boolean().default(true),
  show_social_links: z.boolean().default(true),
  customer_support_menu_ref: z.string().optional(),
  about_us_menu_ref: z.string().optional(),
  copyright_text: z.string().optional(),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

export type FooterConfig = z.infer<typeof footerConfigSchema>;

// ─── Extended Theme Config ──────────────────────────────────────

export const builderThemeConfigSchema = z
  .object({
    // Legacy fields (preserved for backward compat)
    menu: z
      .object({
        main_menu: z.string().optional(),
        customer_support_menu: z.string().optional(),
        about_us_menu: z.string().optional(),
      })
      .optional(),
    topbar: z
      .object({
        message: z.string().optional(),
        container_class: z.string().optional(),
      })
      .optional(),
    homepage: z
      .object({
        collection_slug: z.string().optional(),
      })
      .optional(),
    checkout: z
      .object({
        term_link: z.string().optional(),
        policy_link: z.string().optional(),
      })
      .optional(),
    // Builder fields
    sections: z.array(builderSectionSchema).optional(),
    header: headerConfigSchema.optional(),
    footer: footerConfigSchema.optional(),
  })
  .passthrough();

export type BuilderThemeConfig = z.infer<typeof builderThemeConfigSchema>;

// ─── Theme Version (Store Theme) ────────────────────────────────

export const themeVersionSchema = z.object({
  id: z.number(),
  name: z.string(),
  theme_config_snapshot: builderThemeConfigSchema,
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ThemeVersion = z.infer<typeof themeVersionSchema>;
