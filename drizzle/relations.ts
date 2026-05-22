import { relations } from "drizzle-orm";
import { users, customers, ledgers, payments } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  ledgers: many(ledgers),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  payments: many(payments),
}));

export const ledgersRelations = relations(ledgers, ({ one, many }) => ({
  user: one(users, { fields: [ledgers.userId], references: [users.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(customers, { fields: [payments.customerId], references: [customers.id] }),
  ledger: one(ledgers, { fields: [payments.ledgerId], references: [ledgers.id] }),
}));
