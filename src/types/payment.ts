import { z } from "zod";
import {
  idSchema,
  optionalTimestampSchema,
  deletedAtSchema,
  paymentMethodSchema,
  paymentStatusSchema,
  uuidSchema,
  moneySchema,
} from "./common";

export const paymentSchema = z
  .object({
    id: idSchema, // BigInt in DB, number in shared types
    order_id: idSchema, // BigInt in DB, number here
    bank_account_id: idSchema.optional().nullable(),
    payment_method: paymentMethodSchema,
    amount: moneySchema,
    currency_code: z.string().min(3).max(3).default("VND"),
    status: paymentStatusSchema.default("pending"),
    transaction_id: z.string().optional().nullable(),
    transaction_ref: z.string().optional().nullable(),
    payment_proof_url: z.string().url().optional().nullable(),
    payer_name: z.string().optional().nullable(),
    payer_account_number: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    paid_at: z.iso.datetime().optional().nullable(),
    verified_by: uuidSchema.optional().nullable(),
    verified_at: z.iso.datetime().optional().nullable(),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentSchema = paymentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type CreatePayment = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = paymentSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
