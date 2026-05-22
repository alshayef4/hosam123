import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { idSchema, ledgerCreateSchema, ledgerUpdateSchema } from "@shared/schemas";
import * as ledgerService from "../services/ledgers";

export const ledgersRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ledgerService.listByUser(ctx.user.id)
  ),

  create: protectedProcedure
    .input(ledgerCreateSchema)
    .mutation(({ ctx, input }) =>
      ledgerService.create(ctx.user.id, input)
    ),

  update: protectedProcedure
    .input(ledgerUpdateSchema)
    .mutation(({ ctx, input }) =>
      ledgerService.update(ctx.user.id, input)
    ),

  delete: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(({ ctx, input }) =>
      ledgerService.remove(ctx.user.id, input.id)
    ),

  checkTitleUnique: protectedProcedure
    .input(z.object({ title: z.string() }))
    .query(({ ctx, input }) =>
      ledgerService.checkTitleUnique(ctx.user.id, input.title)
    ),
});
