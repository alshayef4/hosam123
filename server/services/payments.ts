import { TRPCError } from "@trpc/server";
import { getSupabase } from "../supabase-client";
import { sanitizeString } from "../middleware/sanitize";
import { mapPayment } from "../utils/mapFields";
import type { z } from "zod";
import type { paymentUpdateSchema } from "../../shared/schemas";

type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

/**
 * List all payments for a ledger with customer data joined.
 */
export async function listByLedger(_userId: number, ledgerId: string) {
  const supabase = getSupabase();

  // Verify ledger exists
  const { data: ledger, error: ledgerError } = await supabase
    .from("ledgers")
    .select("id")
    .eq("id", ledgerId)
    .single();

  if (ledgerError || !ledger) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "الدفتر غير موجود",
    });
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*, customers(*)")
    .eq("ledger_id", ledgerId);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في جلب المدفوعات",
    });
  }

  return data.map(mapPayment);
}

/**
 * Update a payment record with input sanitization.
 */
export async function update(_userId: number, input: PaymentUpdateInput) {
  const supabase = getSupabase();

  // Verify payment exists
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id")
    .eq("id", input.id)
    .single();

  if (fetchError || !payment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "سجل الدفع غير موجود",
    });
  }

  const updateData: Record<string, unknown> = {};

  if (input.isPaid !== undefined) {
    updateData.is_paid = input.isPaid;
  }

  if (input.paymentDate !== undefined) {
    updateData.payment_date = input.paymentDate
      ? input.paymentDate.toISOString()
      : null;
  }

  if (input.notes !== undefined) {
    updateData.notes = input.notes !== null ? sanitizeString(input.notes) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true };
  }

  const { error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", input.id);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في تحديث سجل الدفع",
    });
  }

  return { success: true };
}

/**
 * Toggle payment status (paid/unpaid) for a specific payment.
 * Sets payment_date to current date when marking as paid, null when unpaid.
 */
export async function toggleStatus(
  _userId: number,
  id: string,
  isPaid: boolean
) {
  const supabase = getSupabase();

  // Verify payment exists
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !payment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "سجل الدفع غير موجود",
    });
  }

  const { error } = await supabase
    .from("payments")
    .update({
      is_paid: isPaid,
      payment_date: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في تحديث حالة الدفع",
    });
  }

  return { success: true };
}
