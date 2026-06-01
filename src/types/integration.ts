import { z } from "zod";
import {
  timestampSchema,
  integrationStatusSchema,
  jsonSchema,
  uuidSchema,
  idSchema,
  OptionalTimestamp,
  Id,
  IntegrationStatus,
} from "./common";

/**
 * Integration-related schemas based on Prisma models
 */

// Integration interface
export interface Integration extends OptionalTimestamp {
  id: Id;
  user_id: string; // UUID
  name: string;
  type: string;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
}

// Create integration input type
export type CreateIntegration = Omit<
  Integration,
  "id" | keyof OptionalTimestamp
>;

// Update integration input type
export type UpdateIntegration = Partial<
  Omit<CreateIntegration, "user_id" | "type">
>;

// Integration config update type
export interface UpdateIntegrationConfig {
  config: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Integration main entity
export const integrationSchema = z
  .object({
    id: idSchema,
    user_id: uuidSchema,
    name: z.string().min(1),
    type: z.string().min(1),
    status: integrationStatusSchema.default("active"),
    config: jsonSchema.default({}),
    metadata: jsonSchema.optional().nullable().default({}),
  })
  .extend(timestampSchema.shape);

// Create integration schema
export const createIntegrationSchema = integrationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}) as unknown as z.ZodType<CreateIntegration>;

// Update integration schema
export const updateIntegrationSchema = integrationSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
  .omit({
    user_id: true,
    type: true, // Type should not be changed after creation
  }) as unknown as z.ZodType<UpdateIntegration>;

// Integration config update schema
export const updateIntegrationConfigSchema = z.object({
  config: jsonSchema,
  metadata: jsonSchema.optional(),
}) as unknown as z.ZodType<UpdateIntegrationConfig>;
