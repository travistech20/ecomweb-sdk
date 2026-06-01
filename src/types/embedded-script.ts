import { z } from "zod";
import {
  idSchema,
  optionalTimestampSchema,
} from "./common";

/**
 * Embedded scripts schema - custom tracking/analytics scripts for stores
 */

// Placement enum - where the script should be injected
export const embeddedScriptPlacementSchema = z.enum([
  "head",
  "body_start",
  "body_end",
]);

export type EmbeddedScriptPlacement = z.infer<
  typeof embeddedScriptPlacementSchema
>;

// Full embedded script schema
export const embeddedScriptSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(255),
  code: z.string().min(1),
  placement: embeddedScriptPlacementSchema,
  created_at: z.iso.datetime().optional().nullable(),
  updated_at: z.iso.datetime().optional().nullable(),
});

export type EmbeddedScript = z.infer<typeof embeddedScriptSchema>;

// Create schema (omits generated fields)
export const createEmbeddedScriptSchema = embeddedScriptSchema.pick({
  name: true,
  code: true,
  placement: true,
});

export type CreateEmbeddedScript = z.infer<typeof createEmbeddedScriptSchema>;

// Update schema (all fields optional)
export const updateEmbeddedScriptSchema = createEmbeddedScriptSchema.partial();

export type UpdateEmbeddedScript = z.infer<typeof updateEmbeddedScriptSchema>;
