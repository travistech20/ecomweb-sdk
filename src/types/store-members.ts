import { z } from "zod";
import {
  timestampSchema,
  deletedAtSchema,
  idSchema,
  uuidSchema,
  emailSchema,
} from "./common";

/**
 * Store Members & Team Invitations schemas
 * Based on Prisma models for team collaboration features
 */

// ==================== Enums ====================

// Team role enum (matches Prisma enum)
export const teamRoleSchema = z.enum(["OWNER", "ADMIN", "STAFF"]);
export type TeamRole = z.infer<typeof teamRoleSchema>;

// Invitation status enum (matches Prisma enum)
export const invitationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

// ==================== Store Team Member ====================

// Store team member entity schema
export const storeTeamMemberSchema = z
  .object({
    id: idSchema,
    user_id: uuidSchema,
    role: teamRoleSchema,
    is_active: z.boolean().default(true),
    invited_by: uuidSchema.nullable(),
    joined_at: z.iso.datetime(),
  })
  .extend(timestampSchema.shape)
  .extend(deletedAtSchema.shape);

// Create team member input (internal use, typically from invitation acceptance)
export const createStoreTeamMemberSchema = storeTeamMemberSchema.pick({
  user_id: true,
  role: true,
  invited_by: true,
  is_active: true,
});

// Update team member input
export const updateStoreTeamMemberSchema = z.object({
  role: teamRoleSchema.optional(),
  is_active: z.boolean().optional(),
});

// Team member with user profile (for display)
export const storeTeamMemberWithProfileSchema = storeTeamMemberSchema.extend({
  user: z
    .object({
      id: uuidSchema,
      email: emailSchema,
      name: z.string(),
      avatar_url: z.string().nullable(),
    })
    .nullable(),
});

// ==================== Store Team Invitation ====================

// Store team invitation entity schema
export const storeTeamInvitationSchema = z
  .object({
    id: idSchema,
    store_ref: z.string().optional(),
    email: emailSchema,
    user_id: uuidSchema.nullable(),
    role: teamRoleSchema,
    message: z.string().nullable(),
    status: invitationStatusSchema.default("PENDING"),
    token: z.string(),
    invited_by: uuidSchema,
    expires_at: z.iso.datetime(),
    accepted_at: z.iso.datetime().nullable(),
    rejected_at: z.iso.datetime().nullable(),
    rejection_reason: z.string().nullable(),
  })
  .extend(timestampSchema.shape)
  .extend(deletedAtSchema.shape);

// Create invitation input (for API)
export const createStoreTeamInvitationSchema = z.object({
  email: emailSchema,
  role: teamRoleSchema,
  message: z.string().max(500).optional().nullable(),
});

// Update invitation input (internal use)
export const updateStoreTeamInvitationSchema = z.object({
  status: invitationStatusSchema.optional(),
  accepted_at: z.iso.datetime().nullable().optional(),
  rejected_at: z.iso.datetime().nullable().optional(),
  rejection_reason: z.string().max(500).nullable().optional(),
});

// Accept invitation input
export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

// Reject invitation input
export const rejectInvitationSchema = z.object({
  token: z.string().min(1),
  rejection_reason: z.string().max(500).optional(),
});

// Cancel invitation input (admin/owner action)
export const cancelInvitationSchema = z.object({
  invitation_id: idSchema,
});

// ==================== Member Management ====================

// Remove member input
export const removeMemberSchema = z.object({
  member_id: idSchema,
});

// Update member role input (for API)
export const updateMemberRoleSchema = z.object({
  member_id: idSchema,
  new_role: teamRoleSchema.refine((role) => role !== "OWNER", {
    message: "Cannot change role to OWNER. Use transfer ownership instead.",
  }),
});

// Transfer ownership input
export const transferOwnershipSchema = z.object({
  new_owner_id: uuidSchema,
});

// Leave store input (no body needed, user_id from auth)
export const leaveStoreSchema = z.object({});

// ==================== Query Filters ====================

// List members filter
export const listMembersFilterSchema = z.object({
  role: teamRoleSchema.optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(), // Search by name or email
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
  sort_by: z.enum(["joined_at", "role"]).optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc").optional(),
});

// List invitations filter
export const listInvitationsFilterSchema = z.object({
  status: invitationStatusSchema.optional(),
  email: emailSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
  sort_by: z.enum(["created_at", "expires_at"]).optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc").optional(),
});

// ==================== Response Types ====================

// Member list response
export const memberListResponseSchema = z.object({
  data: z.array(storeTeamMemberWithProfileSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  has_more: z.boolean(),
});

// Invitation list response
export const invitationListResponseSchema = z.object({
  data: z.array(storeTeamInvitationSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  has_more: z.boolean(),
});

// Single member response
export const memberResponseSchema = storeTeamMemberWithProfileSchema;

// Single invitation response
export const invitationResponseSchema = storeTeamInvitationSchema;

// ==================== Permission Helpers ====================

// Permission check types
export const permissionSchema = z.enum([
  "manage_team", // OWNER, ADMIN
  "manage_products", // OWNER, ADMIN, STAFF
  "manage_orders", // OWNER, ADMIN, STAFF
  "view_analytics", // OWNER, ADMIN
  "manage_settings", // OWNER, ADMIN
  "transfer_ownership", // OWNER only
]);

export type Permission = z.infer<typeof permissionSchema>;

// Role permission mapping (for reference)
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  OWNER: [
    "manage_team",
    "manage_products",
    "manage_orders",
    "view_analytics",
    "manage_settings",
    "transfer_ownership",
  ],
  ADMIN: [
    "manage_team",
    "manage_products",
    "manage_orders",
    "view_analytics",
    "manage_settings",
  ],
  STAFF: ["manage_products", "manage_orders"],
};

// ==================== Export Types ====================

export type StoreTeamMember = z.infer<typeof storeTeamMemberSchema>;
export type CreateStoreTeamMember = z.infer<typeof createStoreTeamMemberSchema>;
export type UpdateStoreTeamMember = z.infer<typeof updateStoreTeamMemberSchema>;
export type StoreTeamMemberWithProfile = z.infer<
  typeof storeTeamMemberWithProfileSchema
>;

export type StoreTeamInvitation = z.infer<typeof storeTeamInvitationSchema>;
export type CreateStoreTeamInvitation = z.infer<
  typeof createStoreTeamInvitationSchema
>;
export type UpdateStoreTeamInvitation = z.infer<
  typeof updateStoreTeamInvitationSchema
>;

export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitation = z.infer<typeof rejectInvitationSchema>;
export type CancelInvitation = z.infer<typeof cancelInvitationSchema>;

export type RemoveMember = z.infer<typeof removeMemberSchema>;
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>;
export type TransferOwnership = z.infer<typeof transferOwnershipSchema>;
export type LeaveStore = z.infer<typeof leaveStoreSchema>;

export type ListMembersFilter = z.infer<typeof listMembersFilterSchema>;
export type ListInvitationsFilter = z.infer<typeof listInvitationsFilterSchema>;

export type MemberListResponse = z.infer<typeof memberListResponseSchema>;
export type InvitationListResponse = z.infer<
  typeof invitationListResponseSchema
>;
export type MemberResponse = z.infer<typeof memberResponseSchema>;
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;

// ==================== Validation Helpers ====================

export const validateCreateInvitation = (data: unknown) => {
  return createStoreTeamInvitationSchema.safeParse(data);
};

export const validateAcceptInvitation = (data: unknown) => {
  return acceptInvitationSchema.safeParse(data);
};

export const validateRejectInvitation = (data: unknown) => {
  return rejectInvitationSchema.safeParse(data);
};

export const validateUpdateMemberRole = (data: unknown) => {
  return updateMemberRoleSchema.safeParse(data);
};

export const validateTransferOwnership = (data: unknown) => {
  return transferOwnershipSchema.safeParse(data);
};
