/** Transform a Supabase customer row to camelCase */
export function mapCustomer(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Transform a Supabase ledger row to camelCase */
export function mapLedger(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    monthYear: row.month_year,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Transform a Supabase payment row (with joined customer) to camelCase */
export function mapPayment(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    ledgerId: row.ledger_id,
    isPaid: row.is_paid,
    paymentDate: row.payment_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // If customer data is joined
    customers: row.customers ? mapCustomer(row.customers) : undefined,
  };
}
