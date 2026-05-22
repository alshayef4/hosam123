import { TRPCError } from "@trpc/server";
import { getSupabase } from "../supabase-client";
import { sanitizeString } from "../middleware/sanitize";
import { mapCustomer } from "../utils/mapFields";
import type { CustomerCreateInput, CustomerUpdateInput } from "../../shared/types";

/**
 * List all customers (single-owner app, no userId filtering needed).
 */
export async function listByUser(_userId: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في جلب العملاء",
    });
  }

  return data.map(mapCustomer);
}

/**
 * Create a new customer with sanitized inputs.
 */
export async function create(_userId: number, input: CustomerCreateInput) {
  const supabase = getSupabase();

  const sanitizedFullName = sanitizeString(input.fullName);
  const sanitizedPhone = sanitizeString(input.phoneNumber);
  const sanitizedNotes = input.notes ? sanitizeString(input.notes) : null;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: sanitizedFullName,
      phone_number: sanitizedPhone,
      notes: sanitizedNotes,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في إنشاء العميل",
    });
  }

  return mapCustomer(data);
}

/**
 * Update an existing customer with sanitized inputs.
 */
export async function update(_userId: number, input: CustomerUpdateInput) {
  const supabase = getSupabase();

  // Verify customer exists
  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", input.id)
    .single();

  if (fetchError || !customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "العميل غير موجود",
    });
  }

  const updateData: Record<string, unknown> = {};

  if (input.fullName !== undefined) {
    updateData.full_name = sanitizeString(input.fullName);
  }
  if (input.phoneNumber !== undefined) {
    updateData.phone_number = sanitizeString(input.phoneNumber);
  }
  if (input.notes !== undefined) {
    updateData.notes = input.notes ? sanitizeString(input.notes) : null;
  }
  if (input.isActive !== undefined) {
    updateData.is_active = input.isActive;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", input.id);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في تحديث العميل",
      });
    }
  }

  return { success: true };
}

/**
 * Remove a customer by ID.
 * Cascade deletion of associated payments is handled at the DB level.
 */
export async function remove(_userId: number, customerId: string) {
  const supabase = getSupabase();

  // Verify customer exists
  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .single();

  if (fetchError || !customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "العميل غير موجود",
    });
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في حذف العميل",
    });
  }

  return { success: true };
}

/**
 * Toggle a customer's active/inactive status.
 */
export async function toggleActive(
  _userId: number,
  id: string,
  isActive: boolean
) {
  const supabase = getSupabase();

  // Verify customer exists
  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "العميل غير موجود",
    });
  }

  const { error } = await supabase
    .from("customers")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "فشل في تحديث حالة العميل",
    });
  }

  return { success: true };
}
