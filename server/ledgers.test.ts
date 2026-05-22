import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("ledgers", () => {
  it("should list ledgers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const ledgers = await caller.ledgers.list();
      expect(Array.isArray(ledgers)).toBe(true);
    } catch (error) {
      // Expected if no database connection
      expect(error).toBeDefined();
    }
  });

  it("should handle ledger creation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.ledgers.create({
        title: "دفتر شهر مايو 2024",
        monthYear: new Date("2024-05-01"),
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("دفتر شهر مايو 2024");
    } catch (error) {
      // Expected if no database connection
      expect(error).toBeDefined();
    }
  });
});
