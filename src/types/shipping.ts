import { z } from "zod";
import {
  idSchema,
  optionalTimestampSchema,
  deletedAtSchema,
  jsonSchema,
  moneySchema,
} from "./common";

// Enums
export const shippingFeeTypeSchema = z.enum([
  "FIXED",
  "FORMULA",
  "CARRIER_QUOTE",
]);
export type ShippingFeeType = z.infer<typeof shippingFeeTypeSchema>;

export const shippingProgramStatusSchema = z.enum(["active", "inactive"]);
export type ShippingProgramStatus = z.infer<typeof shippingProgramStatusSchema>;

// Shipping Method (now a table, not an enum)
export const shippingMethodSchema = z
  .object({
    id: idSchema,
    code: z.string().min(1).max(50), // 'standard', 'express', 'pickup', 'cod', etc.
    name: z.string().min(1).max(255), // Display name
    description: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    metadata: jsonSchema.default({}),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type ShippingMethod = z.infer<typeof shippingMethodSchema>;

export const createShippingMethodSchema = shippingMethodSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type CreateShippingMethod = z.infer<typeof createShippingMethodSchema>;

export const updateShippingMethodSchema = shippingMethodSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateShippingMethod = z.infer<typeof updateShippingMethodSchema>;

// Shipping Zone
export const shippingZoneSchema = z
  .object({
    id: idSchema, // Int
    code: z.string().min(1),
    name: z.string().min(1),
    geo_json: jsonSchema.optional().nullable(),
    provinces: z.array(z.string()).default([]),
    districts: z.array(z.string()).default([]),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type ShippingZone = z.infer<typeof shippingZoneSchema>;

export const createShippingZoneSchema = shippingZoneSchema
  .omit({ id: true, created_at: true, updated_at: true, deleted_at: true })
  .partial({ provinces: true, districts: true, geo_json: true });

export type CreateShippingZone = z.infer<typeof createShippingZoneSchema>;

export const updateShippingZoneSchema = shippingZoneSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateShippingZone = z.infer<typeof updateShippingZoneSchema>;

// Shipping Program
export const shippingProgramSchema = z
  .object({
    id: idSchema, // BigInt in DB, number here
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    status: shippingProgramStatusSchema.default("active"),
    priority: z.int().default(100),
    version: z.int().default(1),
    effective_from: z.iso.datetime().optional().nullable(),
    effective_to: z.iso.datetime().optional().nullable(),
    is_default: z.boolean().default(false),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type ShippingProgram = z.infer<typeof shippingProgramSchema>;

export const createShippingProgramSchema = shippingProgramSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  version: true,
});

export type CreateShippingProgram = z.infer<typeof createShippingProgramSchema>;

export const updateShippingProgramSchema = shippingProgramSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateShippingProgram = z.infer<typeof updateShippingProgramSchema>;

// Shipping Rule
export const shippingRuleSchema = z
  .object({
    id: idSchema, // BigInt in DB, number here
    program_id: idSchema, // BigInt in DB, number here
    name: z.string().min(1),
    method_id: idSchema.optional().nullable(), // Reference to shipping_methods table
    fee_type: shippingFeeTypeSchema.default("FIXED"),
    fixed_amount: moneySchema.optional().nullable(),
    formula: z.string().optional().nullable(),
    carrier_code: z.string().optional().nullable(),
    zone_id: idSchema.optional().nullable(),
    min_weight_gr: z.int().min(0).optional().nullable(),
    max_weight_gr: z.int().min(0).optional().nullable(),
    min_order_value: moneySchema.optional().nullable(),
    max_order_value: moneySchema.optional().nullable(),
    postal_prefix: z.string().optional().nullable(),
    condition_json: jsonSchema.optional().nullable(),
    sort_order: z.int().default(100),
    is_active: z.boolean().default(true),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type ShippingRule = z.infer<typeof shippingRuleSchema>;

export const createShippingRuleSchema = shippingRuleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type CreateShippingRule = z.infer<typeof createShippingRuleSchema>;

export const updateShippingRuleSchema = shippingRuleSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateShippingRule = z.infer<typeof updateShippingRuleSchema>;
