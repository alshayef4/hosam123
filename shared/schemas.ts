import { z } from "zod";

/**
 * Shared Zod validation schemas for the Payment Ledger system.
 * Used by both frontend (react-hook-form) and backend (tRPC input validation).
 * All error messages are in Arabic.
 */

// UUID validation for entity IDs (Supabase-generated UUIDs)
export const idSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "معرّف غير صالح"
  );

// ─── Customer Schemas ────────────────────────────────────────────────────────

export const customerCreateSchema = z.object({
  fullName: z.string().min(1, "الاسم مطلوب").max(1000),
  phoneNumber: z
    .string()
    .min(1, "رقم الجوال مطلوب")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "رقم الجوال يجب أن يحتوي على 10 أرقام على الأقل"
    ),
  notes: z.string().max(1000).optional(),
});

export const customerUpdateSchema = z.object({
  id: idSchema,
  fullName: z.string().min(1, "الاسم مطلوب").max(1000).optional(),
  phoneNumber: z
    .string()
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "رقم الجوال يجب أن يحتوي على 10 أرقام على الأقل"
    )
    .optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

// ─── Ledger Schemas ──────────────────────────────────────────────────────────

export const ledgerCreateSchema = z.object({
  title: z.string().min(1, "عنوان الدفتر مطلوب").max(1000),
  monthYear: z.date(),
});

export const ledgerUpdateSchema = z.object({
  id: idSchema,
  title: z.string().min(1, "عنوان الدفتر مطلوب").max(1000).optional(),
  isActive: z.boolean().optional(),
});

// ─── Payment Schemas ─────────────────────────────────────────────────────────

export const paymentUpdateSchema = z.object({
  id: idSchema,
  isPaid: z.boolean().optional(),
  paymentDate: z.date().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});
