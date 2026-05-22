import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customers table - stores customer information
 *
 * Foreign key constraints (enforced at Supabase/PostgreSQL level):
 *   - userId → users.id
 *
 * Cascade behavior:
 *   - ON DELETE of a customer, all associated payments are cascade-deleted
 *     (enforced via: ALTER TABLE payments ADD CONSTRAINT fk_payments_customer
 *      FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE)
 */
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /** FK → users.id (enforced at database level) */
  userId: int("userId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Ledgers table - stores monthly ledgers
 *
 * Foreign key constraints (enforced at Supabase/PostgreSQL level):
 *   - userId → users.id
 *
 * Cascade behavior:
 *   - ON DELETE of a ledger, all associated payments are cascade-deleted
 *     (enforced via: ALTER TABLE payments ADD CONSTRAINT fk_payments_ledger
 *      FOREIGN KEY (ledgerId) REFERENCES ledgers(id) ON DELETE CASCADE)
 */
export const ledgers = mysqlTable("ledgers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /** FK → users.id (enforced at database level) */
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  monthYear: date("monthYear").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ledger = typeof ledgers.$inferSelect;
export type InsertLedger = typeof ledgers.$inferInsert;

/**
 * Payments table - stores payment status for each customer in each ledger
 *
 * Foreign key constraints (enforced at Supabase/PostgreSQL level):
 *   - customerId → customers.id (ON DELETE CASCADE)
 *   - ledgerId → ledgers.id (ON DELETE CASCADE)
 *
 * Unique constraint:
 *   - (customerId, ledgerId) — prevents duplicate payment records for the
 *     same customer within the same ledger
 *
 * Cascade behavior:
 *   - Payments are cascade-deleted when their parent customer OR ledger is deleted
 */
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /** FK → customers.id (ON DELETE CASCADE, enforced at database level) */
  customerId: varchar("customerId", { length: 36 }).notNull(),
  /** FK → ledgers.id (ON DELETE CASCADE, enforced at database level) */
  ledgerId: varchar("ledgerId", { length: 36 }).notNull(),
  isPaid: boolean("isPaid").default(false).notNull(),
  paymentDate: timestamp("paymentDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  /** Unique composite index: one payment per customer per ledger (Req 14.8) */
  uniqueCustomerLedger: uniqueIndex("unique_customer_ledger")
    .on(table.customerId, table.ledgerId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
