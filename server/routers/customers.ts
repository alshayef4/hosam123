import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  idSchema,
  customerCreateSchema,
  customerUpdateSchema,
} from "@shared/schemas";
import * as customerService from "../services/customers";

export const customersRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    customerService.listByUser(ctx.user.id)
  ),

  create: protectedProcedure
    .input(customerCreateSchema)
    .mutation(({ ctx, input }) =>
      customerService.create(ctx.user.id, input)
    ),

  update: protectedProcedure
    .input(customerUpdateSchema)
    .mutation(({ ctx, input }) =>
      customerService.update(ctx.user.id, input)
    ),

  delete: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(({ ctx, input }) =>
      customerService.remove(ctx.user.id, input.id)
    ),

  toggleActive: protectedProcedure
    .input(z.object({ id: idSchema, isActive: z.boolean() }))
    .mutation(({ ctx, input }) =>
      customerService.toggleActive(ctx.user.id, input.id, input.isActive)
    ),
});
