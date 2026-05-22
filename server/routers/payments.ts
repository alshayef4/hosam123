import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { idSchema, paymentUpdateSchema } from "@shared/schemas";
import * as paymentService from "../services/payments";
import { getSupabase } from "../supabase-client";

async function getPaymentStatistics(ledgerId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("payments")
    .select("is_paid")
    .eq("ledger_id", ledgerId);

  const allPayments = data || [];
  const paidCount = allPayments.filter((p) => p.is_paid).length;
  return {
    total: allPayments.length,
    paid: paidCount,
    unpaid: allPayments.length - paidCount,
  };
}

export const paymentsRouter = router({
  listByLedger: protectedProcedure
    .input(z.object({ ledgerId: idSchema }))
    .query(({ ctx, input }) =>
      paymentService.listByLedger(ctx.user.id, input.ledgerId)
    ),

  update: protectedProcedure
    .input(paymentUpdateSchema)
    .mutation(({ ctx, input }) =>
      paymentService.update(ctx.user.id, input)
    ),

  toggleStatus: protectedProcedure
    .input(z.object({ id: idSchema, isPaid: z.boolean() }))
    .mutation(({ ctx, input }) =>
      paymentService.toggleStatus(ctx.user.id, input.id, input.isPaid)
    ),

  getStats: protectedProcedure
    .input(z.object({ ledgerId: idSchema }))
    .query(({ input }) => getPaymentStatistics(input.ledgerId)),
});
