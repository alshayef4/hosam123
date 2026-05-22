import { Router, Request, Response } from "express";
import { getSupabase } from "./supabase-client";

/**
 * Lightweight health check using Supabase.
 */
async function healthCheck(): Promise<{ status: "connected" | "disconnected" }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("customers").select("id").limit(1);
    return { status: error ? "disconnected" : "connected" };
  } catch {
    return { status: "disconnected" };
  }
}

/**
 * Health check Express router.
 *
 * GET /health — executes a lightweight DB ping (SELECT 1) and responds
 * within 5 seconds with { status: "connected" | "disconnected" }.
 *
 * Usage: mount with `app.use(healthRouter)` or `app.use("/", healthRouter)`
 * when integrating into the main server.
 */
export const healthRouter = Router();

const HEALTH_TIMEOUT_MS = 5_000;

healthRouter.get("/health", async (_req: Request, res: Response) => {
  // Race the health check against a 5-second timeout
  const timeoutPromise = new Promise<{ status: "disconnected" }>((resolve) => {
    setTimeout(() => resolve({ status: "disconnected" }), HEALTH_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([healthCheck(), timeoutPromise]);

    res.status(result.status === "connected" ? 200 : 503).json({
      status: result.status,
    });
  } catch {
    res.status(503).json({ status: "disconnected" });
  }
});
