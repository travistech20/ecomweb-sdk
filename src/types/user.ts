import { z } from "zod";
import {
  timestampSchema,
  emailSchema,
  urlSchema,
  uuidSchema,
} from "./common";

/**
 * User-related schemas for user profile management
 * Aligned with backend user module implementation
 */

// Vietnamese phone number validation
export const vietnamesePhoneSchema = z
  .string()
  .regex(/^(\+84|84|0)[3-9][0-9]{8}$/, {
    message: "Số điện thoại không hợp lệ",
  })
  .optional();

// User name validation for Vietnamese names
export const userNameSchema = z
  .string()
  .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
  .max(100, { message: "Tên không được vượt quá 100 ký tự" })
  .regex(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: "Tên chỉ được chứa chữ cái và khoảng trắng",
  })
  .transform((name) => name.trim());

// User profile schema
export const userProfileSchema = z
  .object({
    id: uuidSchema,
    email: emailSchema,
    name: userNameSchema,
    phone: vietnamesePhoneSchema,
    avatar_url: urlSchema,
  })
  .extend(timestampSchema.shape);

// Create user profile input (for registration)
export const createUserProfileSchema = userProfileSchema
  .pick({
    email: true,
    name: true,
    phone: true,
    avatar_url: true,
  })
  .required({
    email: true,
    name: true,
  });

// Update user profile input
export const updateUserProfileSchema = z.object({
  name: userNameSchema.optional(),
  phone: vietnamesePhoneSchema,
  avatar_url: urlSchema,
});

// User profile response schema (matches backend DTO)
export const userProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Authentication user schema (from JWT payload)
export const authenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  isAnonymous: z.boolean(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// User metadata schema (for Supabase user_metadata)
export const userMetadataSchema = z.object({
  name: userNameSchema.optional(),
  phone: vietnamesePhoneSchema,
  avatar_url: urlSchema,
});

// Export types
export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type UserMetadata = z.infer<typeof userMetadataSchema>;

// Validation helpers
export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};

export const validateUpdateUserProfile = (data: unknown) => {
  return updateUserProfileSchema.safeParse(data);
};

export const validateUserMetadata = (data: unknown) => {
  return userMetadataSchema.safeParse(data);
};

// Form validation schemas (for frontend forms)
export const userProfileFormSchema = z.object({
  name: userNameSchema,
  phone: vietnamesePhoneSchema,
  avatar_url: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "URL ảnh đại diện không hợp lệ",
      },
    )
    .optional(),
});

export type UserProfileForm = z.infer<typeof userProfileFormSchema>;

// API error response schema
export const userApiErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string().optional(),
});

export type UserApiError = z.infer<typeof userApiErrorSchema>;
