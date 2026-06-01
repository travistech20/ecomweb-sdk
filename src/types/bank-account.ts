import { z } from "zod";
import {
  idSchema,
  optionalTimestampSchema,
  deletedAtSchema,
} from "./common";

export const bankAccountSchema = z
  .object({
    id: idSchema,
    label: z.string().min(1),
    bank_code: z.string().min(1),
    bank_name: z.string().min(1),
    account_number: z.string().min(1),
    account_holder: z.string().min(1),
    qr_payload: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
  })
  .extend(optionalTimestampSchema.shape)
  .extend(deletedAtSchema.shape);

export type BankAccount = z.infer<typeof bankAccountSchema>;

export const createBankAccountSchema = bankAccountSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type CreateBankAccount = z.infer<typeof createBankAccountSchema>;

export const updateBankAccountSchema = bankAccountSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial();

export type UpdateBankAccount = z.infer<typeof updateBankAccountSchema>;
