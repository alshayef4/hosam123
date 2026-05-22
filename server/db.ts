import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  InsertUser,
  users,
  customers,
  InsertCustomer,
  ledgers,
  InsertLedger,
  payments,
  InsertPayment,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// ─── Connection Pool Configuration ───────────────────────────────────────────

const POOL_CONFIG = {
  connectionLimit: 10,    // max connections
  waitForConnections: true,
  idleTimeout: 60_000,    // 60s idle timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
};

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const BACKGROUND_RETRY_INTERVAL_MS = 30_000;
const AUTO_RECONNECT_ATTEMPTS = 3;
const AUTO_RECONNECT_WINDOW_MS = 30_000;

// ─── Connection State Machine ────────────────────────────────────────────────

export type ConnectionState = "connected" | "disconnected" | "reconnecting";

let connectionState: ConnectionState = "disconnected";
let pool: mysql.Pool | null = null;
// Drizzle ORM has a type mismatch between mysql2/promise Pool and mysql2 Pool
// At runtime, drizzle() works correctly with mysql2/promise pools
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let backgroundRetryTimer: ReturnType<typeof setInterval> | null = null;

function logStateChange(
  newState: ConnectionState,
  meta?: Record<string, unknown>
): void {
  const prev = connectionState;
  connectionState = newState;
  console.log(
    `[DB] ${new Date().toISOString()} State: ${prev} → ${newState}`,
    meta ? JSON.stringify(meta) : ""
  );
}

// ─── Exponential Backoff Helper ──────────────────────────────────────────────

/**
 * Computes the backoff delay for a given attempt number.
 * Formula: min(2^(attempt-1) * 1000, 30000) ms
 */
export function computeBackoffDelay(attempt: number): number {
  return Math.min(Math.pow(2, attempt - 1) * BASE_DELAY_MS, MAX_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Pool Initialization with Exponential Backoff ────────────────────────────

/**
 * Initializes the MySQL connection pool with exponential backoff retry.
 * Retries up to 5 times with delays: 1s, 2s, 4s, 8s, 16s (capped at 30s).
 * If all retries fail, starts background retry every 30s (degraded mode).
 */
export async function initializePool(): Promise<void> {
  const databaseUrl = ENV.databaseUrl || process.env.DATABASE_URL;

  if (!databaseUrl) {
    logStateChange("disconnected", { reason: "No DATABASE_URL configured" });
    startBackgroundRetry();
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logStateChange("reconnecting", { attempt, maxRetries: MAX_RETRIES });

      pool = mysql.createPool({
        uri: databaseUrl,
        ...POOL_CONFIG,
      });

      // Verify connection with a lightweight ping
      const connection = await pool.getConnection();
      await connection.query("SELECT 1");
      connection.release();

      // Create Drizzle instance from pool
      _db = drizzle(pool);

      logStateChange("connected", { attempt });
      stopBackgroundRetry();
      setupConnectionErrorHandling();
      return;
    } catch (error) {
      const delay = computeBackoffDelay(attempt);
      console.error(
        `[DB] Connection attempt ${attempt}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt < MAX_RETRIES) {
        console.log(`[DB] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted — enter degraded mode
  logStateChange("disconnected", {
    reason: "All connection attempts exhausted",
  });
  startBackgroundRetry();
}

// ─── Background Retry (Degraded Mode) ───────────────────────────────────────

function startBackgroundRetry(): void {
  if (backgroundRetryTimer) return; // Already running

  console.log(
    `[DB] Starting background retry every ${BACKGROUND_RETRY_INTERVAL_MS / 1000}s`
  );

  backgroundRetryTimer = setInterval(async () => {
    if (connectionState === "connected") {
      stopBackgroundRetry();
      return;
    }

    const databaseUrl = ENV.databaseUrl || process.env.DATABASE_URL;
    if (!databaseUrl) return;

    try {
      logStateChange("reconnecting", { source: "background-retry" });

      const newPool = mysql.createPool({
        uri: databaseUrl,
        ...POOL_CONFIG,
      });

      const connection = await newPool.getConnection();
      await connection.query("SELECT 1");
      connection.release();

      // Success — replace pool
      if (pool) {
        try {
          await pool.end();
        } catch {
          // Ignore errors closing old pool
        }
      }

      pool = newPool;
      _db = drizzle(pool);
      logStateChange("connected", { source: "background-retry" });
      stopBackgroundRetry();
      setupConnectionErrorHandling();
    } catch (error) {
      logStateChange("disconnected", {
        source: "background-retry",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, BACKGROUND_RETRY_INTERVAL_MS);
}

function stopBackgroundRetry(): void {
  if (backgroundRetryTimer) {
    clearInterval(backgroundRetryTimer);
    backgroundRetryTimer = null;
    console.log("[DB] Background retry stopped");
  }
}

// ─── Auto-Reconnection on Connection Loss ────────────────────────────────────

function setupConnectionErrorHandling(): void {
  if (!pool) return;

  pool.on("connection", () => {
    // Connection acquired from pool — no action needed
  });

  // Note: mysql2 pool handles connection errors internally,
  // but we add a layer for auto-reconnection on fatal errors
}

/**
 * Attempts auto-reconnection when a connection error is detected.
 * Tries 3 times within 30 seconds before giving up.
 */
async function attemptAutoReconnect(): Promise<boolean> {
  const databaseUrl = ENV.databaseUrl || process.env.DATABASE_URL;
  if (!databaseUrl) return false;

  const intervalMs = AUTO_RECONNECT_WINDOW_MS / AUTO_RECONNECT_ATTEMPTS; // ~10s between attempts

  for (let attempt = 1; attempt <= AUTO_RECONNECT_ATTEMPTS; attempt++) {
    try {
      logStateChange("reconnecting", {
        source: "auto-reconnect",
        attempt,
        maxAttempts: AUTO_RECONNECT_ATTEMPTS,
      });

      const newPool = mysql.createPool({
        uri: databaseUrl,
        ...POOL_CONFIG,
      });

      const connection = await newPool.getConnection();
      await connection.query("SELECT 1");
      connection.release();

      // Success — replace pool
      if (pool) {
        try {
          await pool.end();
        } catch {
          // Ignore errors closing old pool
        }
      }

      pool = newPool;
      _db = drizzle(pool);
      logStateChange("connected", { source: "auto-reconnect", attempt });
      setupConnectionErrorHandling();
      return true;
    } catch (error) {
      console.error(
        `[DB] Auto-reconnect attempt ${attempt}/${AUTO_RECONNECT_ATTEMPTS} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt < AUTO_RECONNECT_ATTEMPTS) {
        await sleep(intervalMs);
      }
    }
  }

  // All auto-reconnect attempts failed
  logStateChange("disconnected", {
    reason: "Auto-reconnection failed after all attempts",
  });
  startBackgroundRetry();
  return false;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the current connection state.
 */
export function getConnectionState(): ConnectionState {
  return connectionState;
}

/**
 * Returns the Drizzle database instance or throws a service-unavailable error.
 * If a connection error is detected, triggers auto-reconnection.
 */
export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (_db && connectionState === "connected") {
    return _db;
  }

  // If we have a pool but state is not connected, try a quick ping
  if (pool && connectionState !== "connected") {
    try {
      const connection = await pool.getConnection();
      await connection.query("SELECT 1");
      connection.release();
      logStateChange("connected", { source: "getDb-ping" });
      if (!_db) {
        _db = drizzle(pool);
      }
      return _db;
    } catch {
      // Connection is truly lost, attempt reconnection
      const reconnected = await attemptAutoReconnect();
      if (reconnected && _db) {
        return _db;
      }
    }
  }

  // Fallback: try lazy initialization (backward compatibility)
  if (!_db && (ENV.databaseUrl || process.env.DATABASE_URL)) {
    try {
      await initializePool();
      if (_db) return _db;
    } catch {
      // Fall through to error
    }
  }

  throw new Error("الخدمة غير متاحة حالياً، حاول لاحقاً"); // Service unavailable
}

/**
 * Health check: executes a lightweight SELECT 1 ping.
 * Returns connection status without throwing.
 */
export async function healthCheck(): Promise<{
  status: "connected" | "disconnected";
  latencyMs?: number;
}> {
  const start = Date.now();

  try {
    if (!pool) {
      return { status: "disconnected" };
    }

    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();

    const latencyMs = Date.now() - start;
    return { status: "connected", latencyMs };
  } catch {
    return { status: "disconnected" };
  }
}

/**
 * Gracefully shuts down the connection pool.
 */
export async function closePool(): Promise<void> {
  stopBackgroundRetry();
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      console.error("[DB] Error closing pool:", error);
    }
    pool = null;
    _db = null;
    logStateChange("disconnected", { reason: "Pool closed" });
  }
}

// ─── Existing Query Helpers (preserved for _core/ compatibility) ─────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  try {
    const db = await getDb();

    const result = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
}

/**
 * Customers queries
 */
export async function getCustomerById(id: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomersByUserId(userId: number) {
  const db = await getDb();
  return db.select().from(customers).where(eq(customers.userId, userId));
}

export async function getActiveCustomersByUserId(userId: number) {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isActive, true)));
}

export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  await db.insert(customers).values(data);
}

export async function updateCustomer(
  id: string,
  data: Partial<InsertCustomer>
) {
  const db = await getDb();
  await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: string) {
  const db = await getDb();
  await db.delete(customers).where(eq(customers.id, id));
}

/**
 * Ledgers queries
 */
export async function getLedgersByUserId(userId: number) {
  const db = await getDb();
  return db
    .select()
    .from(ledgers)
    .where(eq(ledgers.userId, userId))
    .orderBy(desc(ledgers.monthYear));
}

export async function getActiveLedgerByUserId(userId: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(ledgers)
    .where(and(eq(ledgers.userId, userId), eq(ledgers.isActive, true)))
    .limit(1);
  return result[0] || null;
}

export async function getLedgerById(id: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(ledgers)
    .where(eq(ledgers.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createLedger(data: InsertLedger) {
  const db = await getDb();
  await db.insert(ledgers).values(data);
}

export async function updateLedger(id: string, data: Partial<InsertLedger>) {
  const db = await getDb();
  await db.update(ledgers).set(data).where(eq(ledgers.id, id));
}

export async function deleteLedger(id: string) {
  const db = await getDb();
  await db.delete(ledgers).where(eq(ledgers.id, id));
}

/**
 * Payments queries
 */
export async function getPaymentsByLedgerId(ledgerId: string) {
  const db = await getDb();
  return db.select().from(payments).where(eq(payments.ledgerId, ledgerId));
}

export async function getPaymentsByLedgerIdWithCustomers(ledgerId: string) {
  const db = await getDb();
  return db
    .select({
      payment: payments,
      customer: customers,
    })
    .from(payments)
    .innerJoin(customers, eq(payments.customerId, customers.id))
    .where(eq(payments.ledgerId, ledgerId));
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  await db.insert(payments).values(data);
}

export async function updatePayment(id: string, data: Partial<InsertPayment>) {
  const db = await getDb();
  await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getPaymentStatistics(ledgerId: string) {
  const db = await getDb();
  const allPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.ledgerId, ledgerId));
  const paidCount = allPayments.filter((p) => p.isPaid).length;
  return {
    total: allPayments.length,
    paid: paidCount,
    unpaid: allPayments.length - paidCount,
  };
}
