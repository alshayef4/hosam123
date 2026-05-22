/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─── Inferred types from Zod validation schemas ────────────────────────────
import type { z } from "zod";
import type {
  customerCreateSchema,
  customerUpdateSchema,
  ledgerCreateSchema,
  ledgerUpdateSchema,
  paymentUpdateSchema,
} from "./schemas";

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type LedgerCreateInput = z.infer<typeof ledgerCreateSchema>;
export type LedgerUpdateInput = z.infer<typeof ledgerUpdateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

// ─── tRPC router output type inference ──────────────────────────────────────
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../server/routers";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
