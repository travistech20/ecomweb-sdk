import { z } from "zod";
import {
  optionalTimestampSchema,
  urlSchema,
  strictUrlSchema,
  positionOrderSchema,
  idSchema,
  OptionalTimestamp,
  Id,
} from "./common";

/**
 * Banner-related schemas based on Prisma models
 */

// Banner interface
export interface Banner extends OptionalTimestamp {
  id: Id;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  position: number;
  is_active: boolean;
  metadata: any;
}

// Banner main entity
export const bannerSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1),
    subtitle: z.string().optional().nullable(),
    image_url: strictUrlSchema,
    link_url: urlSchema,
    button_text: z.string().optional().nullable(),
    position: positionOrderSchema,
    is_active: z.boolean().default(true),
    metadata: z.any(),
  })
  .extend(optionalTimestampSchema.shape);

// Create banner input
export interface CreateBanner
  extends Omit<Banner, "id" | keyof OptionalTimestamp> {}

export const createBannerSchema = bannerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update banner input
export type UpdateBanner = Partial<CreateBanner>;

export const updateBannerSchema = createBannerSchema.partial();

// Banner position update for reordering
export interface UpdateBannerPosition {
  id: Id;
  position: number;
}

export const updateBannerPositionSchema = z.object({
  id: idSchema,
  position: z.int32(),
});
