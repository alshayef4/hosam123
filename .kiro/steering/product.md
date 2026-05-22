# Product Overview

**دفتر السداد** (Payment Ledger) is an Arabic-language monthly payment tracking system. It allows a business owner to manage customers and track their monthly payment status across ledger periods.

## Core Domain

- **Customers**: People who owe recurring monthly payments. Each has a name, phone number, notes, and active/inactive status.
- **Ledgers**: Monthly periods (e.g., "January 2025") that group payment records together.
- **Payments**: Per-customer, per-ledger records tracking whether a customer has paid for a given month, with optional payment date and notes.

## Key Workflows

1. Create and manage a customer list
2. Create monthly ledgers
3. Track payment status (paid/unpaid) for each customer within a ledger
4. View payment statistics and reports per ledger

## Users

Single-owner internal tool (dashboard-style). The owner (Fawaz Al-Shayef) manages all data. Authentication is via Manus OAuth.

## Language

The UI is in Arabic (RTL). Validation messages, labels, and user-facing strings are in Arabic.
