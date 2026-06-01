import type {
  BlogSettings,
  BlogPost as BaseBlogPost,
  BlogCategory,
  BlogTag,
  BlogPostStatus,
  BaseQueryParams,
} from "../../types";

export interface SeoMetadata {
  meta_title: string | null;
  meta_description: string | null;
}

export interface WithSeoMetadata {
  seo_metadata?: SeoMetadata | null;
}

export type BlogPost = BaseBlogPost &
  WithSeoMetadata & {
    product_ids?: number[];
  };

export interface BlogPostQueryParams extends BaseQueryParams {
  slug?: string;
  category_id?: number;
  category_slug?: string;
  tag_id?: number;
  tag_slug?: string;
  is_featured?: boolean;
  include_categories?: boolean;
  include_tags?: boolean;
  include_author?: boolean;
}

export interface BlogCategoryQueryParams extends BaseQueryParams {
  include_post_counts?: boolean;
}

export interface BlogTagQueryParams extends BaseQueryParams {
  include_post_counts?: boolean;
}

export type { BlogSettings, BlogCategory, BlogTag, BlogPostStatus };
