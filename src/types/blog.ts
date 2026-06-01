import { z } from "zod";
import {
  optionalTimestampSchema,
  blogPostStatusSchema,
  slugSchema,
  colorSchema,
  urlSchema,
  emailSchema,
  positionOrderSchema,
  uuidSchema,
  idSchema,
  OptionalTimestamp,
  Id,
  BlogPostStatus,
} from "./common";

/**
 * Blog-related schemas based on Prisma models
 */

// Table of Contents item interface
export interface TocItem {
  id: string;
  level: number;
  textContent: string;
  pos: number;
}

// Table of Contents item schema
export const tocItemSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1).max(6),
  textContent: z.string(),
  pos: z.number().int(),
});

// Blog category interface
export interface BlogCategory extends OptionalTimestamp {
  id: Id;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sort_order: number;
}

// Blog tag interface
export interface BlogTag extends OptionalTimestamp {
  id: Id;
  name: string;
  slug: string;
}

// Blog post interface
export interface BlogPost extends OptionalTimestamp {
  id: Id;
  title: string;
  slug: string;
  content: string | null;
  toc: TocItem[] | null;
  excerpt: string | null;
  featured_image_url: string | null;
  status: BlogPostStatus;
  is_featured: boolean;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  view_count: number;
  reading_time: number;
  created_at: string;
}

// Blog comment interface
export interface BlogComment {
  id: Id;
  blog_post_id: Id | null;
  parent_comment_id: Id | null;
  author_name: string;
  author_email: string;
  author_website: string | null;
  content: string;
  is_approved: boolean;
  created_at: string | null;
}

// Blog settings interface
export interface BlogSettings extends OptionalTimestamp {
  id: Id;
  is_enabled: boolean;
  blog_title: string;
  blog_description: string | null;
  posts_per_page: number;
  allow_comments: boolean;
  moderate_comments: boolean;
  show_author: boolean;
  show_reading_time: boolean;
  enable_rss: boolean;
  custom_css: string | null;
}

// Blog post category (many-to-many) interface
export interface BlogPostCategory {
  blog_post_id: Id;
  blog_category_id: Id;
}

// Blog post tag (many-to-many) interface
export interface BlogPostTag {
  blog_post_id: Id;
  blog_tag_id: Id;
}

// Blog category
export const blogCategorySchema = z
  .object({
    id: idSchema,
    name: z.string().min(1).max(100),
    slug: slugSchema.max(100),
    description: z.string().optional().nullable(),
    color: colorSchema,
    sort_order: positionOrderSchema,
  })
  .extend(optionalTimestampSchema.shape);

// Blog tag
export const blogTagSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1).max(50),
    slug: slugSchema.max(50),
  })
  .extend(optionalTimestampSchema.shape);

// Blog post
export const blogPostSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1).max(255),
    slug: slugSchema.max(255),
    content: z.string().optional().nullable(),
    toc: z.array(tocItemSchema).optional().nullable(),
    excerpt: z.string().optional().nullable(),
    featured_image_url: urlSchema,
    status: blogPostStatusSchema.default("draft"),
    is_featured: z.boolean().default(false),
    scheduled_at: z.iso.datetime().optional().nullable(),
    published_at: z.iso.datetime().optional().nullable(),
    author_id: uuidSchema.optional().nullable(),
    view_count: z.int32().default(0),
    reading_time: z.int32().default(0),
  })
  .extend(optionalTimestampSchema.shape);

// Blog comment
export const blogCommentSchema = z.object({
  id: idSchema,
  blog_post_id: idSchema.optional().nullable(),
  parent_comment_id: idSchema.optional().nullable(),
  author_name: z.string().min(1).max(100),
  author_email: emailSchema,
  author_website: z.url().max(255).optional().nullable(),
  content: z.string().min(1),
  is_approved: z.boolean().default(false),
  created_at: z.iso.datetime().optional().nullable(),
});

// Blog settings
export const blogSettingsSchema = z
  .object({
    id: idSchema,
    is_enabled: z.boolean().default(true),
    blog_title: z.string().max(255).default("Blog"),
    blog_description: z.string().optional().nullable(),
    posts_per_page: z.int32().default(10),
    allow_comments: z.boolean().default(true),
    moderate_comments: z.boolean().default(true),
    show_author: z.boolean().default(true),
    show_reading_time: z.boolean().default(true),
    enable_rss: z.boolean().default(true),
    custom_css: z.string().optional().nullable(),
  })
  .extend(optionalTimestampSchema.shape);

// Blog post categories (many-to-many)
export const blogPostCategorySchema = z.object({
  blog_post_id: idSchema,
  blog_category_id: idSchema,
});

// Blog post tags (many-to-many)
export const blogPostTagSchema = z.object({
  blog_post_id: idSchema,
  blog_tag_id: idSchema,
});

// Create schemas
export const createBlogCategorySchema = blogCategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const createBlogTagSchema = blogTagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const createBlogPostSchema = blogPostSchema.omit({
  id: true,
  view_count: true,
  created_at: true,
  updated_at: true,
});

export const createBlogCommentSchema = blogCommentSchema.omit({
  id: true,
  created_at: true,
});

export const createBlogSettingsSchema = blogSettingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update schemas
export const updateBlogCategorySchema = createBlogCategorySchema.partial();

export const updateBlogTagSchema = createBlogTagSchema.partial();

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const updateBlogCommentSchema = createBlogCommentSchema.partial().omit({
  blog_post_id: true,
});

export const updateBlogSettingsSchema = createBlogSettingsSchema.partial();

// Blog post with relations
export interface BlogPostWithRelations
  extends Omit<BlogPost, "blog_categories" | "blog_tags" | "blog_comments"> {
  blog_categories?: BlogCategory[];
  blog_tags?: BlogTag[];
  blog_comments?: BlogComment[];
}

export const blogPostWithRelationsSchema = blogPostSchema.extend({
  blog_categories: z.array(blogCategorySchema).optional(),
  blog_tags: z.array(blogTagSchema).optional(),
  blog_comments: z.array(blogCommentSchema).optional(),
}) as unknown as z.ZodType<BlogPostWithRelations>;

// Blog comment with replies
export interface BlogCommentWithReplies extends Omit<BlogComment, "replies"> {
  replies?: BlogCommentWithReplies[];
}

const blogCommentWithRepliesSchemaInner = z.lazy(() =>
  blogCommentSchema.extend({
    replies: z.array(blogCommentWithRepliesSchemaInner).optional(),
  }),
) as z.ZodType<BlogCommentWithReplies>;

export const blogCommentWithRepliesSchema = blogCommentWithRepliesSchemaInner;

// Create types
export type CreateBlogCategory = Omit<
  BlogCategory,
  "id" | keyof OptionalTimestamp
>;
export type CreateBlogTag = Omit<BlogTag, "id" | keyof OptionalTimestamp>;
export type CreateBlogPost = Omit<
  BlogPost,
  "id" | "view_count" | keyof OptionalTimestamp
>;
export type CreateBlogComment = Omit<BlogComment, "id" | "created_at">;
export type CreateBlogSettings = Omit<
  BlogSettings,
  "id" | keyof OptionalTimestamp
>;

// Update types
export type UpdateBlogCategory = Partial<CreateBlogCategory>;
export type UpdateBlogTag = Partial<CreateBlogTag>;
export type UpdateBlogPost = Partial<CreateBlogPost>;
export type UpdateBlogComment = Partial<
  Omit<CreateBlogComment, "blog_post_id">
>;
export type UpdateBlogSettings = Partial<CreateBlogSettings>;
