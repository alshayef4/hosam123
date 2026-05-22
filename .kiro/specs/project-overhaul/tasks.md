# Implementation Plan: Project Overhaul (دفتر السداد)

## Overview

This plan transforms the Payment Ledger from a prototype with dual data layers, missing auth enforcement, and duplicated code into a production-ready application. Tasks are ordered to avoid breaking the project: shared schemas and DB layer first, then backend restructuring, then frontend improvements, then cleanup and testing.

## Tasks

- [x] 1. Set up shared schemas and foundational types
  - [x] 1.1 Create shared Zod validation schemas in `shared/schemas.ts`
    - Define `idSchema` (21-char nanoid pattern with Arabic error message)
    - Define `customerCreateSchema`, `customerUpdateSchema`
    - Define `ledgerCreateSchema`, `ledgerUpdateSchema`
    - Define `paymentUpdateSchema`
    - Export all schemas for use by both frontend and backend
    - _Requirements: 17.3, 13.1, 13.4, 7.1, 7.2_

  - [x] 1.2 Update `shared/types.ts` with type re-exports
    - Export inferred types from Zod schemas (e.g., `CustomerCreateInput`, `LedgerCreateInput`)
    - Add tRPC `inferRouterOutputs` utility type export placeholder
    - _Requirements: 17.4, 12.2, 12.3_

- [x] 2. Enhance database layer and schema
  - [x] 2.1 Update `drizzle/schema.ts` with constraints
    - Add unique composite index on `(customerId, ledgerId)` in payments table
    - Ensure foreign key columns are properly typed
    - Add cascade delete annotations for payments on customer/ledger deletion
    - _Requirements: 14.7, 14.8, 14.5, 14.6_

  - [x] 2.2 Create `drizzle/relations.ts` with Drizzle ORM relations
    - Define `usersRelations` (one-to-many: customers, ledgers)
    - Define `customersRelations` (belongs-to user, one-to-many payments)
    - Define `ledgersRelations` (belongs-to user, one-to-many payments)
    - Define `paymentsRelations` (belongs-to customer, belongs-to ledger)
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 2.3 Enhance `server/db.ts` with connection pooling, retry, and health check
    - Implement `initializePool()` with exponential backoff (5 retries, 1s base, 30s cap)
    - Add connection state machine (connected/disconnected/reconnecting) with logging
    - Configure pool: min 2, max 10, idle timeout 60s
    - Implement background retry every 30s in degraded mode
    - Implement `healthCheck()` function (lightweight `SELECT 1` ping)
    - Add `getDb()` helper that returns pool or throws service-unavailable
    - Implement auto-reconnection (3 attempts within 30s) on connection loss
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 8.5, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [ ]* 2.4 Write property test for exponential backoff timing
    - **Property 17: Exponential Backoff Timing**
    - Verify `computeBackoffDelay(N)` equals `min(2^(N-1) * 1000, 30000)` for N in 1..5
    - **Validates: Requirements 19.1**

  - [x] 2.5 Create `server/health.ts` endpoint
    - Implement GET `/health` route returning `{ status: "connected" | "disconnected" }`
    - Execute lightweight DB query, respond within 5 seconds
    - _Requirements: 19.2_

- [x] 3. Create backend middleware
  - [x] 3.1 Create `server/middleware/rateLimiter.ts`
    - Implement IP-based sliding window rate limiter (30 requests per 60s)
    - Return `{ allowed, retryAfter }` from `checkRateLimit(ip)`
    - Clean up expired entries periodically
    - _Requirements: 13.3, 13.7_

  - [x] 3.2 Create `server/middleware/sanitize.ts`
    - Implement `sanitizeString()`: strip HTML tags, limit to 1000 chars
    - Export for use in service layer
    - _Requirements: 13.2_

  - [ ]* 3.3 Write property test for input sanitization
    - **Property 12: Input Sanitization**
    - Verify no HTML tags remain after sanitization for any input string
    - Verify output length ≤ 1000 for any input longer than 1000 chars
    - **Validates: Requirements 13.2**

  - [ ]* 3.4 Write property test for ID format validation
    - **Property 13: ID Format Validation**
    - Verify valid 21-char nanoid strings are accepted
    - Verify strings not matching the pattern are rejected
    - **Validates: Requirements 13.4, 13.6**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create backend service layer
  - [x] 5.1 Create `server/services/customers.ts`
    - Implement `listByUser(userId)`, `create(userId, input)`, `update(userId, input)`, `remove(userId, customerId)`, `toggleActive(userId, id, isActive)`
    - Add ownership verification (throw FORBIDDEN if not owner)
    - Apply `sanitizeString` to all string inputs
    - _Requirements: 2.3, 2.4, 2.7, 13.2, 17.6, 18.1, 18.2_

  - [x] 5.2 Create `server/services/ledgers.ts`
    - Implement `listByUser(userId)`, `create(userId, input)`, `update(userId, input)`, `remove(userId, ledgerId)`, `checkTitleUnique(userId, title)`
    - Add ownership verification
    - Apply `sanitizeString` to string inputs
    - _Requirements: 2.3, 2.5, 2.7, 13.2, 17.6, 18.3_

  - [x] 5.3 Create `server/services/payments.ts`
    - Implement `listByLedger(userId, ledgerId)`, `update(userId, input)`, `toggleStatus(userId, id, isPaid)`
    - Scope queries through parent ledger's userId
    - Apply `sanitizeString` to notes field
    - _Requirements: 2.6, 2.7, 13.2, 17.6, 18.4_

- [x] 6. Create domain-driven routers
  - [x] 6.1 Create `server/routers/customers.ts`
    - Define `list`, `create`, `update`, `delete`, `toggleActive` procedures
    - Use `protectedProcedure` for all operations
    - Validate inputs with shared Zod schemas
    - Validate ID format before DB queries
    - Delegate to customer service functions
    - _Requirements: 2.1, 2.2, 13.1, 13.4, 13.6, 17.1_

  - [x] 6.2 Create `server/routers/ledgers.ts`
    - Define `list`, `create`, `update`, `delete`, `checkTitleUnique` procedures
    - Use `protectedProcedure` for all operations
    - Validate inputs with shared Zod schemas
    - Delegate to ledger service functions
    - _Requirements: 2.1, 2.2, 13.1, 17.1_

  - [x] 6.3 Create `server/routers/payments.ts`
    - Define `listByLedger`, `update`, `toggleStatus` procedures
    - Use `protectedProcedure` for all operations
    - Validate inputs with shared Zod schemas
    - Delegate to payment service functions
    - _Requirements: 2.1, 2.2, 13.1, 17.1_

  - [x] 6.4 Create `server/routers/index.ts` to compose appRouter
    - Import and merge all domain routers
    - Export `AppRouter` type for frontend inference
    - Integrate rate limiter middleware
    - Wire health check endpoint
    - _Requirements: 17.1, 13.3_

  - [ ]* 6.5 Write property test for authentication enforcement
    - **Property 2: Authentication Enforcement**
    - Verify unauthenticated calls to any protected procedure return 401
    - **Validates: Requirements 2.2**

  - [ ]* 6.6 Write property test for user data isolation
    - **Property 3: User Data Isolation**
    - Verify all returned records belong exclusively to the authenticated user
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**

  - [ ]* 6.7 Write property test for ownership enforcement on mutations
    - **Property 4: Ownership Enforcement on Mutations**
    - Verify update/delete on non-owned resources returns 403
    - **Validates: Requirements 2.7**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create frontend utility modules
  - [x] 8.1 Create `client/src/lib/formatDate.ts`
    - Implement `formatDate(date)` using `ar-SA` locale
    - Handle null/undefined/invalid dates with "—" placeholder
    - _Requirements: 3.6, 6.6, 12.6_

  - [x] 8.2 Create `client/src/lib/animations.ts`
    - Define `pageTransition`, `staggerContainer`, `staggerItem`, `cardHover`, `dialogAnimation` presets
    - Define `reducedMotion` variant for `prefers-reduced-motion`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

  - [ ]* 8.3 Write property test for date formatting ar-SA locale
    - **Property 6: Date Formatting ar-SA Locale**
    - Verify `formatDate` produces Arabic script characters for any valid Date
    - **Validates: Requirements 3.6, 6.6**

  - [ ]* 8.4 Write property test for null field rendering
    - **Property 11: Null Field Rendering**
    - Verify null paymentDate/notes render "—" and never "null" or "undefined"
    - **Validates: Requirements 12.6**

- [x] 9. Create shared frontend components
  - [x] 9.1 Create `client/src/components/DataTable.tsx`
    - Implement generic table with pagination (20 rows/page), sortable columns, hover highlight, alternating rows
    - Add count summary (total, filtered, displayed)
    - Add search/filter support
    - Integrate empty state when no data
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 9.2 Create `client/src/components/LoadingState.tsx`
    - Implement skeleton loading component with configurable message
    - Match dimensions of content being loaded
    - _Requirements: 6.3, 8.2, 20.4_

  - [x] 9.3 Create `client/src/components/EmptyState.tsx`
    - Implement centered placeholder with icon, message, and optional action button
    - _Requirements: 6.4, 11.6_

  - [x] 9.4 Create `client/src/components/CreateLedgerDialog.tsx`
    - Extract create-ledger form dialog with title + monthYear fields
    - Use react-hook-form + shared Zod schema for validation
    - Add title uniqueness check via tRPC query
    - Display Arabic validation errors inline
    - _Requirements: 6.1, 7.1, 7.3, 7.5, 7.6, 7.7, 7.8_

  - [x] 9.5 Create `client/src/components/ExportButtons.tsx`
    - Extract export button group (Excel, CSV) accepting data array and filename
    - _Requirements: 6.2, 18.6_

  - [x] 9.6 Create `client/src/components/OfflineIndicator.tsx`
    - Display fixed banner when network is unavailable
    - Integrate with TanStack Query's onlineManager
    - Auto-retry failed requests (3 times, 5s interval)
    - _Requirements: 16.2_

  - [ ]* 9.7 Write property test for table pagination invariant
    - **Property 8: Table Pagination Invariant**
    - Verify DataTable displays exactly `min(20, remaining)` items per page for N > 20
    - **Validates: Requirements 11.1**

  - [ ]* 9.8 Write property test for column sorting correctness
    - **Property 9: Column Sorting Correctness**
    - Verify ascending sort produces non-decreasing order for any sortable column
    - **Validates: Requirements 11.2**

  - [ ]* 9.9 Write property test for count summary invariant
    - **Property 10: Count Summary Invariant**
    - Verify D ≤ F ≤ T and D = min(pageSize, F - (page-1)*pageSize)
    - **Validates: Requirements 11.5**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Refactor frontend pages
  - [x] 11.1 Consolidate Home + Dashboard into single `client/src/pages/Dashboard.tsx`
    - Merge KPI cards, charts, quick-action navigation into "/" route
    - Use `CreateLedgerDialog`, `LoadingState`, `ExportButtons` components
    - Implement lazy loading with React.lazy + Suspense
    - Apply page transition animations
    - _Requirements: 6.5, 8.1, 9.1, 18.5_

  - [x] 11.2 Refactor `client/src/pages/customers/index.tsx`
    - Use `DataTable` component with sortable columns
    - Use shared `LoadingState`, `EmptyState`, `ExportButtons`
    - Implement customer search by name/phone
    - Apply stagger animations for list items
    - Use react-hook-form + shared Zod schema for customer form
    - Display Arabic validation errors inline
    - _Requirements: 7.1, 7.2, 7.3, 11.1, 11.2, 11.3, 11.4, 11.5, 18.1, 18.2, 18.7_

  - [x] 11.3 Refactor `client/src/pages/ledgers/index.tsx`
    - Use `DataTable` component for ledger list
    - Use shared `CreateLedgerDialog`, `LoadingState`, `EmptyState`
    - _Requirements: 11.1, 18.3_

  - [x] 11.4 Refactor `client/src/pages/ledgers/LedgerDetail.tsx`
    - Use `DataTable` for payment list with status filter (all/paid/unpaid)
    - Implement optimistic update with rollback for payment toggle
    - Add breadcrumb navigation (Ledgers > current ledger name)
    - Use `ExportButtons` for payment data export
    - _Requirements: 10.2, 16.3, 18.4, 18.5, 18.7_

  - [x] 11.5 Refactor `client/src/pages/reports/index.tsx`
    - Use shared `LoadingState`, `ExportButtons`
    - Maintain pie chart and bar chart for payment statistics
    - Add PDF export support
    - _Requirements: 18.5, 18.6_

  - [ ]* 11.6 Write property test for optimistic update revert
    - **Property 16: Optimistic Update Revert**
    - Verify payment status reverts to original value on mutation failure
    - **Validates: Requirements 16.3**

  - [ ]* 11.7 Write property test for Arabic validation messages
    - **Property 5: Arabic Validation Messages**
    - Verify all validation error messages contain Arabic characters (Unicode \u0600-\u06FF)
    - **Validates: Requirements 3.5, 7.1**

  - [ ]* 11.8 Write property test for phone number validation
    - **Property 7: Phone Number Validation**
    - Verify strings with < 10 digits are rejected with Arabic error
    - **Validates: Requirements 7.2**

- [x] 12. Update App.tsx and layout components
  - [x] 12.1 Update `client/src/App.tsx` with lazy routes and providers
    - Set `dir="rtl"` and `lang="ar"` on document root
    - Implement React.lazy for all page components
    - Configure TanStack Query client (staleTime: 30s, gcTime: 5min, retry: 3)
    - Add Error Boundary with Arabic fallback
    - Remove Home route (consolidated into Dashboard)
    - _Requirements: 3.1, 4.1, 8.1, 8.3, 16.5_

  - [x] 12.2 Update `client/src/components/DashboardLayout.tsx`
    - Position sidebar on inline-start (right in RTL)
    - Highlight active navigation item with differentiated style
    - Implement collapsible sidebar on mobile (< 768px) with overlay
    - Add sticky top header on mobile with nav trigger + page title
    - Animate sidebar collapse/expand (300ms ease-out)
    - Display app logo + "دفتر السداد" title in sidebar header
    - Hide title in collapsed state, show only icon
    - Use logical CSS properties (ms-, me-, ps-, pe-) throughout
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 5.1, 5.6, 5.7, 9.5, 10.1, 10.6, 10.7_

  - [x] 12.3 Update `client/src/components/ErrorBoundary.tsx`
    - Render Arabic error fallback with RTL layout
    - Include reload button ("إعادة تحميل")
    - _Requirements: 3.3, 16.5_

  - [x] 12.4 Create `client/src/hooks/usePrefetch.ts`
    - Prefetch target page data on navigation link hover
    - _Requirements: 8.4, 10.3_

  - [x] 12.5 Create `client/src/hooks/useScrollRestore.ts`
    - Restore scroll position on browser back navigation
    - _Requirements: 10.5_

- [x] 13. Implement error handling and recovery patterns
  - [x] 13.1 Configure tRPC error handling on frontend
    - Display Arabic toast notifications for API errors (4s auto-dismiss)
    - Preserve form field values on mutation failure
    - Show retry button after all retries exhausted
    - Handle timeout > 5s with retry option
    - _Requirements: 16.1, 16.4, 16.6, 8.6, 3.4, 3.7_

  - [ ]* 13.2 Write property test for database error response structure
    - **Property 1: Database Error Response Structure**
    - Verify failed DB operations return `{ error: true, message: string }` with non-empty message
    - **Validates: Requirements 1.5**

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Apply RTL, responsive, and UI polish
  - [x] 15.1 Apply RTL layout fixes across all components
    - Replace physical properties (ml-, mr-, left, right) with logical (ms-, me-, start, end)
    - Position search icons on inline-start side of inputs
    - Align table headers/cells to inline-start
    - Ensure numeric values and Latin text render LTR within RTL containers
    - _Requirements: 4.3, 4.4, 4.5, 4.7, 4.8_

  - [x] 15.2 Apply responsive design across all pages
    - Stack grids to single-column on mobile (< 768px)
    - Wrap tables in horizontally scrollable container on mobile
    - Scale heading font sizes (h1: 1.875rem mobile / 3rem desktop, etc.)
    - Ensure 44x44px minimum touch targets on mobile
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 15.3 Apply UI polish and design tokens
    - Use 8px-multiple spacing (8, 16, 24, 32, 40, 48)
    - Apply consistent border-radius from --radius token
    - Ensure WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text/UI)
    - Use Lucide icons at correct sizes (16px inline, 20px buttons, 24px headings)
    - Add visible focus ring (2px, --ring color, 2px offset) on keyboard focus
    - _Requirements: 20.1, 20.2, 20.3, 20.5, 20.6_

  - [x] 15.4 Implement skeleton loading states matching content dimensions
    - Create skeletons for Dashboard cards, table rows, chart areas
    - Replace plain spinners with dimension-matched skeletons
    - Show error state after 5s skeleton timeout
    - _Requirements: 20.4, 20.7, 8.2_

- [x] 16. Implement keyboard navigation and accessibility
  - [x] 16.1 Ensure keyboard navigation across all interactive elements
    - All nav items, buttons, links, form controls reachable via Tab
    - Activatable via Enter/Space
    - Visible focus indicator on focused element
    - _Requirements: 10.4_

- [x] 17. Clean up unused dependencies and files
  - [x] 17.1 Remove Supabase layer and unused dependencies
    - Delete `server/supabase-db.ts`
    - Remove `@supabase/supabase-js` from package.json
    - Remove `next-themes` from package.json
    - Remove `vite-plugin-manus-runtime` from devDependencies
    - Remove Manus plugin import from `vite.config.ts`
    - _Requirements: 1.3, 1.4, 15.1, 15.2_

  - [x] 17.2 Remove unused files and components
    - Delete `.manus` directory and `client/public/__manus__` directory
    - Delete `AIChatBox.tsx`, `ManusDialog.tsx`, `Map.tsx` (zero imports)
    - Delete `Home.tsx` (consolidated into Dashboard)
    - Clean up empty `drizzle/relations.ts` if it only has empty import
    - Remove unused `@radix-ui/*` packages with zero imports in `components/ui/`
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 17.3 Install testing dependencies and verify build
    - Add `fast-check` and `@fast-check/vitest` to devDependencies
    - Run `pnpm run build` and `pnpm run check` to verify zero errors
    - _Requirements: 15.7_

- [ ] 18. Preserve existing functionality verification
  - [ ]* 18.1 Write integration tests for CRUD workflows
    - Test customer CRUD (create, read, update, delete, toggle active)
    - Test ledger CRUD (create, read, update, delete)
    - Test payment status toggle and date recording
    - Test search/filter functionality
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.7_

  - [ ]* 18.2 Write integration tests for export and theme
    - Test Excel/CSV export for customers and ledgers
    - Test PDF export for reports
    - Test dark/light theme toggle persistence
    - _Requirements: 18.6, 18.8_

  - [ ]* 18.3 Write property test for cascade deletion integrity
    - **Property 14: Cascade Deletion Integrity**
    - Verify deleting a customer/ledger leaves zero associated payments
    - **Validates: Requirements 14.5, 14.6**

  - [ ]* 18.4 Write property test for payment uniqueness constraint
    - **Property 15: Payment Uniqueness Constraint**
    - Verify duplicate (customerId, ledgerId) pair insertion fails
    - **Validates: Requirements 14.8**

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The ordering ensures foundational changes (schemas, DB, middleware) land before dependent code (routers, services, pages)
- `server/_core/` is never modified — all changes work around the existing framework infrastructure
- All code uses TypeScript with the existing path aliases (`@/*`, `@shared/*`)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["2.4", "2.5", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["6.4", "6.5", "6.6", "6.7"] },
    { "id": 6, "tasks": ["8.1", "8.2"] },
    { "id": 7, "tasks": ["8.3", "8.4", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6"] },
    { "id": 8, "tasks": ["9.7", "9.8", "9.9"] },
    { "id": 9, "tasks": ["11.1", "11.2", "11.3", "11.5"] },
    { "id": 10, "tasks": ["11.4", "11.6", "11.7", "11.8"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5"] },
    { "id": 12, "tasks": ["13.1", "13.2"] },
    { "id": 13, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 14, "tasks": ["16.1"] },
    { "id": 15, "tasks": ["17.1", "17.2"] },
    { "id": 16, "tasks": ["17.3"] },
    { "id": 17, "tasks": ["18.1", "18.2", "18.3", "18.4"] }
  ]
}
```
