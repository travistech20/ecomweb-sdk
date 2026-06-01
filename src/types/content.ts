import { z } from "zod";
import {
  timestampSchema,
  slugSchema,
  positionOrderSchema,
  idSchema,
  OptionalTimestamp,
  Id,
} from "./common";

/**
 * Content-related schemas based on Prisma models
 */

// Content page interface
export interface ContentPage extends OptionalTimestamp {
  id: Id;
  title: string;
  content: string | null;
  is_published: boolean;
  page_type: string | null;
  sort_order: number;
  slug: string;
}

// Create content page input type
export type CreateContentPage = Omit<
  ContentPage,
  "id" | keyof OptionalTimestamp
>;

// Update content page input type
export type UpdateContentPage = Partial<CreateContentPage>;

// Content page
export const contentPageSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1),
    content: z.string().optional().nullable(),
    is_published: z.boolean().default(false),
    page_type: z.string().optional().nullable(),
    sort_order: positionOrderSchema,
    slug: slugSchema.max(255),
  })
  .extend(timestampSchema.shape);

// Create content page schema
export const createContentPageSchema = contentPageSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update content page schema
export const updateContentPageSchema = contentPageSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial();
