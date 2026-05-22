import { TRPCError } from "@trpc/server";
import { getSupabase } from "../supabase-client";
import { sanitizeString } from "../middleware/sanitize";
import { mapLedger } from "../utils/mapFields";
import type { z } from "zod";
import type {
  ledgerCreateSchema,
  ledgerUpdateSchema,
} from "../../shared/schemas";

type LedgerCreateInput = z.infer<typeof ledgerCreateSchema>;
type LedgerUpdateInput = z.infer<typeof ledgerUpdateSchema>;

/**
 * List all ledgers ordered by month_year descending.
 */
export async function listByUser(_userId: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ledgers")
    .select("*")
    .order("month_year", { ascending: false });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في جلب الدفاتر",
    });
  }

  return data.map(mapLedger);
}

/**
 * Create a new ledger and generate payment records for all active customers.
 */
export async function create(_userId: number, input: LedgerCreateInput) {
  const supabase = getSupabase();
  const sanitizedTitle = sanitizeString(input.title);

  // Insert the ledger
  const { data: ledger, error: ledgerError } = await supabase
    .from("ledgers")
    .insert({
      title: sanitizedTitle,
      month_year: input.monthYear.toISOString(),
      is_active: false,
    })
    .select()
    .single();

  if (ledgerError || !ledger) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في إنشاء الدفتر",
    });
  }

  // Get all active customers to create payment records
  const { data: activeCustomers } = await supabase
    .from("customers")
    .select("id")
    .eq("is_active", true);

  if (activeCustomers && activeCustomers.length > 0) {
    const paymentRecords = activeCustomers.map((customer) => ({
      customer_id: customer.id,
      ledger_id: ledger.id,
      is_paid: false,
      payment_date: null,
      notes: null,
    }));

    const { error: paymentsError } = await supabase
      .from("payments")
      .insert(paymentRecords);

    if (paymentsError) {
      console.error("[Ledgers] Failed to create payment records:", paymentsError);
    }
  }

  return mapLedger(ledger);
}

/**
 * Update an existing ledger with input sanitization.
 */
export async function update(_userId: number, input: LedgerUpdateInput) {
  const supabase = getSupabase();

  // Verify ledger exists
  const { data: ledger, error: fetchError } = await supabase
    .from("ledgers")
    .select("id")
    .eq("id", input.id)
    .single();

  if (fetchError || !ledger) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "الدفتر غير موجود",
    });
  }

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) {
    updateData.title = sanitizeString(input.title);
  }
  if (input.isActive !== undefined) {
    updateData.is_active = input.isActive;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("ledgers")
      .update(updateData)
      .eq("id", input.id);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في تحديث الدفتر",
      });
    }
  }

  // Return the updated ledger
  const { data: updated } = await supabase
    .from("ledgers")
    .select("*")
    .eq("id", input.id)
    .single();

  return mapLedger(updated);
}

/**
 * Remove a ledger by ID.
 * Cascade deletion of associated payments is handled at the database level.
 */
export async function remove(_userId: number, ledgerId: string) {
  const supabase = getSupabase();

  // Verify ledger exists
  const { data: ledger, error: fetchError } = await supabase
    .from("ledgers")
    .select("id")
    .eq("id", ledgerId)
    .single();

  if (fetchError || !ledger) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "الدفتر غير موجود",
    });
  }

  const { error } = await supabase
    .from("ledgers")
    .delete()
    .eq("id", ledgerId);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في حذف الدفتر",
    });
  }

  return { success: true };
}

/**
 * Check if a ledger title is unique.
 * Returns true if the title is unique (not already used), false otherwise.
 */
export async function checkTitleUnique(
  _userId: number,
  title: string
): Promise<boolean> {
  const supabase = getSupabase();
  const sanitizedTitle = sanitizeString(title);

  const { data, error } = await supabase
    .from("ledgers")
    .select("id")
    .ilike("title", sanitizedTitle);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في التحقق من العنوان",
    });
  }

  return !data || data.length === 0;
}
