import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { customersRouter } from "./routers/customers";
import { ledgersRouter } from "./routers/ledgers";
import { paymentsRouter } from "./routers/payments";

// ─── Rate Limiter Integration ────────────────────────────────────────────────
// The checkRateLimit function is ready in server/middleware/rateLimiter.ts.
// It will be integrated as tRPC middleware in a future iteration.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Health Check Endpoint ───────────────────────────────────────────────────
// The healthRouter (Express router) is created in server/health.ts and needs
// to be mounted on the Express app via `app.use(healthRouter)`.
// ─────────────────────────────────────────────────────────────────────────────

// Development-only mock user when OAuth is not configured
const DEV_MOCK_USER = !process.env.OAUTH_SERVER_URL ? {
  id: 1,
  openId: "dev-local-user",
  name: "مطور محلي",
  email: "dev@localhost",
  loginMethod: "dev",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
} : null;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      // In development without OAuth, return mock user so the app doesn't block on login
      if (!ctx.user && DEV_MOCK_USER) {
        return DEV_MOCK_USER;
      }
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Domain routers (protectedProcedure, service layer, shared schemas)
  customers: customersRouter,
  ledgers: ledgersRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
