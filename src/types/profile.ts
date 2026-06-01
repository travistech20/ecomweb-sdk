import { z } from "zod";
import {
  timestampSchema,
  emailSchema,
  urlSchema,
  uuidSchema,
} from "./common";

/**
 * Profile-related schemas based on Prisma models
 */

// Profile main entity
export const profileSchema = z
  .object({
    id: uuidSchema,
    name: z.string().optional().nullable(),
    email: emailSchema.optional().nullable(),
    avatar_url: urlSchema,
  })
  .extend(timestampSchema.shape);

// Create profile input
export const createProfileSchema = profileSchema;

// Update profile input
export const updateProfileSchema = createProfileSchema.partial().omit({
  id: true,
});

// Export types
export type Profile = z.infer<typeof profileSchema>;
export type CreateProfile = z.infer<typeof createProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
