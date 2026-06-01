import { z } from "zod";
import {
  idSchema,
  optionalTimestampSchema,
  deletedAtSchema,
  paymentMethodSchema,
  jsonSchema,
  positionOrderSchema,
} from "./common";

export const storePaymentMethodSchema = z
  .object({
    id: idSchema,
    payment_method: paymentMethodSchema,
    display_name: z.string().min(1),
    description: z.string().optional().nullable(),
    is_enabled: z.boolean().default(true),
    sort_order: positionOrderSchema.default(0),
    settings: jsonSchema.default({}),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type StorePaymentMethod = z.infer<typeof storePaymentMethodSchema>;

export const createStorePaymentMethodSchema = storePaymentMethodSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type CreateStorePaymentMethod = z.infer<
  typeof createStorePaymentMethodSchema
>;

export const updateStorePaymentMethodSchema = storePaymentMethodSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateStorePaymentMethod = z.infer<
  typeof updateStorePaymentMethodSchema
>;
