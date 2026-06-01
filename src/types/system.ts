import { z } from "zod";
import {
  timestampSchema,
  messageOutboxStatusSchema,
  jsonSchema,
  uuidSchema,
} from "./common";

/**
 * System-level schemas based on Prisma models
 */

// Message outbox for reliable message delivery
export const messageOutboxSchema = z
  .object({
    id: uuidSchema,
    topic: z.string().min(1),
    partition_key: z.string().optional().nullable(),
    message: jsonSchema,
    status: messageOutboxStatusSchema.default("PENDING"),
    attempts: z.int32().default(0),
    next_attempt_at: z.iso.datetime().optional().nullable(),
    locked_at: z.iso.datetime().optional().nullable(),
    locked_by: z.string().optional().nullable(),
    published_at: z.iso.datetime().optional().nullable(),
    last_error: z.string().optional().nullable(),
  })
  .extend(timestampSchema.shape);

// OAuth states for secure OAuth flows
export const oauthStateSchema = z.object({
  id: z.string(),
  state: z.string(),
  code_verifier: z.string(),
  user_id: z.string(),
  nonce: z.string().max(255).optional().nullable(),
  created_at: z.iso.datetime().optional().nullable(),
  expires_at: z.iso.datetime(),
  consumed_at: z.iso.datetime().optional().nullable(),
});

export const createMessageOutboxSchema = messageOutboxSchema.omit({
  id: true,
  status: true,
  attempts: true,
  locked_at: true,
  locked_by: true,
  published_at: true,
  last_error: true,
  created_at: true,
  updated_at: true,
});

export const createOauthStateSchema = oauthStateSchema.omit({
  consumed_at: true,
  created_at: true,
});

export const updateMessageOutboxSchema = z.object({
  status: messageOutboxStatusSchema,
  attempts: z.int32(),
  next_attempt_at: z.iso.datetime().optional().nullable(),
  locked_at: z.iso.datetime().optional().nullable(),
  locked_by: z.string().optional().nullable(),
  published_at: z.iso.datetime().optional().nullable(),
  last_error: z.string().optional().nullable(),
});

export const updateOauthStateSchema = z.object({
  consumed_at: z.iso.datetime(),
});

// Export types
export type MessageOutbox = z.infer<typeof messageOutboxSchema>;
export type OauthState = z.infer<typeof oauthStateSchema>;

export type CreateMessageOutbox = z.infer<typeof createMessageOutboxSchema>;
export type CreateOauthState = z.infer<typeof createOauthStateSchema>;

export type UpdateMessageOutbox = z.infer<typeof updateMessageOutboxSchema>;
export type UpdateOauthState = z.infer<typeof updateOauthStateSchema>;
