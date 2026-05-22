# Requirements Document

## Introduction

This document defines the requirements for a comprehensive overhaul of the **دفتر السداد** (Payment Ledger) system. The overhaul transforms the existing codebase into a modern, professional, production-ready application with clean architecture, consistent Arabic RTL support, responsive design, improved security, and optimized performance — while preserving all current functionality.

## Glossary

- **System**: The Payment Ledger application (frontend + backend)
- **Frontend**: The React 19 client application served via Vite
- **Backend**: The Express + tRPC 11 server application
- **Data_Layer**: The database access layer (currently dual: Drizzle ORM + Supabase)
- **Router**: The tRPC router handling API procedures in `server/routers.ts`
- **Dashboard_Layout**: The main layout component with sidebar navigation
- **Customer_Page**: The page managing customer CRUD operations
- **Ledger_Page**: The page managing monthly ledger operations
- **Payment_Page**: The ledger detail page managing payment status
- **Reports_Page**: The page displaying statistics and export functionality
- **Auth_Guard**: The authentication protection mechanism for routes and API procedures
- **Theme_System**: The dark/light mode switching mechanism
- **Export_Module**: The utility module for Excel, CSV, and PDF exports

## Requirements

### Requirement 1: Unify the Data Access Layer

**User Story:** As a developer, I want a single consistent data access layer, so that the codebase is maintainable and database operations are predictable.

#### Acceptance Criteria

1. THE Data_Layer SHALL use Drizzle ORM as the single primary database access mechanism for all CRUD operations on customers, ledgers, and payments tables
2. WHEN the System starts, THE Data_Layer SHALL attempt to establish a connection to the MySQL/TiDB Cloud database using Drizzle ORM within 10 seconds
3. THE Router SHALL call query helper functions exclusively from `server/db.ts` for all database operations, with no direct imports from `server/supabase-db.ts`
4. WHEN all tRPC procedures in `server/routers.ts` have been updated to call `server/db.ts` helpers instead of `server/supabase-db.ts` helpers, THE System SHALL remove the file `server/supabase-db.ts` and its associated Supabase client dependency
5. IF the database connection fails or a query times out, THEN THE Data_Layer SHALL log the error including the operation name and timestamp, and return a structured error response containing an error flag and a human-readable message indicating the failure reason to the client
6. THE Data_Layer SHALL use parameterized queries via Drizzle ORM to prevent SQL injection
7. IF the database connection cannot be established within 10 seconds during system startup, THEN THE Data_Layer SHALL log the connection failure and allow the system to start in a degraded state where database-dependent routes return a service-unavailable error response

### Requirement 2: Enforce Authentication on All API Procedures

**User Story:** As the system owner, I want all data-modifying and data-reading API endpoints to require authentication, so that unauthorized users cannot access or modify data.

#### Acceptance Criteria

1. THE Router SHALL use `protectedProcedure` for all customer, ledger, and payment operations including both queries and mutations
2. WHEN an unauthenticated request reaches a protected procedure, THE Router SHALL return a 401 error with the message defined in `UNAUTHED_ERR_MSG`
3. THE Router SHALL scope all customer and ledger queries by the authenticated user's ID so that a user only retrieves their own records
4. WHEN a customer is created, THE Router SHALL associate the customer with the authenticated user's ID stored in `ctx.user.id`
5. WHEN a ledger is created, THE Router SHALL associate the ledger with the authenticated user's ID stored in `ctx.user.id`
6. THE Router SHALL scope payment queries by filtering on ledgers owned by the authenticated user, since payments are linked to users through their parent ledger's `userId`
7. IF the authenticated user does not own the requested customer, ledger, or payment resource, THEN THE Router SHALL reject the update or delete operation with a 403 forbidden error indicating insufficient ownership
8. THE Router SHALL exclude `auth.me` and `auth.logout` from the `protectedProcedure` requirement, keeping them as public procedures to allow session checking and logout without prior authentication

### Requirement 3: Consistent Arabic Localization

**User Story:** As the system owner, I want all user-facing text to be in Arabic, so that the interface is consistent and professional.

#### Acceptance Criteria

1. THE Frontend SHALL set the document root element to `dir="rtl"` and `lang="ar"` and SHALL display all labels, buttons, headings, error messages, and placeholder text in Arabic
2. THE Frontend SHALL display the 404 Not Found page with Arabic text, right-to-left text alignment, and a navigation control to return to the home page
3. IF an unhandled rendering error occurs, THEN THE Frontend SHALL display the Error Boundary fallback page with Arabic text, right-to-left text alignment, and a reload control
4. THE Frontend SHALL display all toast notification messages (success, error, info, and warning) in Arabic
5. WHEN a form field fails validation, THE Frontend SHALL display the corresponding validation error message in Arabic
6. THE Frontend SHALL use Gregorian calendar date formatting with the `ar-SA` locale for all displayed dates, rendering day, month, and year in Arabic script
7. THE Frontend SHALL display all server-originated error messages shown to the user in Arabic

### Requirement 4: Full RTL Layout Consistency

**User Story:** As the system owner, I want the entire interface to follow RTL layout conventions correctly, so that the Arabic reading experience is natural.

#### Acceptance Criteria

1. THE Frontend SHALL set `dir="rtl"` and `lang="ar"` on the document root `<html>` element
2. THE Dashboard_Layout SHALL position the sidebar on the inline-start side (right side in RTL) of the viewport
3. THE Frontend SHALL render icon spacing on the inline-start side (right in RTL) such that icons appear before their adjacent label text in reading order
4. THE Frontend SHALL position search icons on the inline-start side (right side) of input fields
5. THE Frontend SHALL align table headers and cell content to the inline-start side (right in RTL) by default
6. WHEN navigation items are rendered, THE Dashboard_Layout SHALL display them in right-to-left visual reading order, with the first item appearing at the top-right of the navigation list
7. THE Frontend SHALL use logical CSS properties (`start`/`end`, `ms-`/`me-`) instead of physical directional properties (`left`/`right`, `ml-`/`mr-`) for all spacing and positioning, except where a fixed physical direction is intentionally required (e.g., a decorative element)
8. THE Frontend SHALL preserve left-to-right rendering for numeric values and embedded Latin-script text within RTL containers using the default Unicode bidirectional algorithm

### Requirement 5: Responsive Design Across All Breakpoints

**User Story:** As the system owner, I want the application to work well on mobile phones, tablets, and desktop screens, so that I can manage payments from any device.

#### Acceptance Criteria

1. WHILE the viewport width is below 768px, THE Frontend SHALL render the sidebar as a collapsible overlay that is hidden by default and toggled via a navigation trigger button
2. WHILE the viewport width is below 768px, THE Frontend SHALL stack grid layouts into single-column vertical arrangements
3. WHILE the viewport width is below 768px, THE Frontend SHALL render data tables within a horizontally scrollable container so that all columns remain accessible via swipe
4. THE Frontend SHALL render heading font sizes using the following scale: h1 at 1.875rem on mobile and 3rem on desktop, h2 at 1.5rem on mobile and 2.25rem on desktop, h3 at 1.25rem on mobile and 1.875rem on desktop, with tablet sizes interpolated between mobile and desktop values
5. WHILE the viewport width is below 768px, THE Frontend SHALL render all interactive elements (buttons, links, form controls, menu items) with a minimum touch target size of 44x44 CSS pixels
6. WHILE the viewport width is below 768px, THE Frontend SHALL hide the sidebar resize handle and the sidebar user email text, while keeping all navigation menu items, primary action buttons, and data content visible
7. WHILE the viewport width is below 768px, THE Dashboard_Layout SHALL display a sticky top header fixed to the top of the viewport containing the sidebar navigation trigger button and the current page title

### Requirement 6: Eliminate Duplicated Code and Components

**User Story:** As a developer, I want shared logic extracted into reusable utilities, so that the codebase is DRY and maintainable.

#### Acceptance Criteria

1. THE Frontend SHALL extract the "create ledger" form dialog (containing title text field and monthYear date field with validation and submission logic) into a single reusable component that is imported and rendered by both the Dashboard and Ledgers pages
2. THE Frontend SHALL extract export button groups (Excel, CSV) into a single reusable component that accepts a data array and a filename string as props, and is used by all pages that offer data export
3. THE Frontend SHALL extract the loading state display into a single reusable component that accepts a message string prop and renders a spinner animation with the provided message, used by all pages that display a loading state
4. THE Frontend SHALL extract empty state displays into a single reusable component that accepts a message string prop and renders a centered placeholder with the provided message, used by all pages that display an empty data state
5. THE Frontend SHALL consolidate the Home page and Dashboard page into a single page component serving the "/" route, retaining the KPI cards, charts, and quick-action navigation currently present in the Home page
6. THE Frontend SHALL extract date formatting logic into a shared utility function located in the lib directory that formats dates using the Arabic (ar-SA) locale and is called by all components that display formatted dates
7. WHEN any extracted reusable component is rendered, THE Frontend SHALL produce output that is visually and functionally identical to the original inline implementation it replaced

### Requirement 7: Improve Form Validation and User Feedback

**User Story:** As the system owner, I want clear validation feedback when entering data, so that I can correct mistakes before submission.

#### Acceptance Criteria

1. WHEN a required field is left empty and the user attempts to submit the form, THE Frontend SHALL display an inline error message in Arabic below the corresponding field indicating that the field is required
2. WHEN a phone number field value does not contain at least 10 digits (after removing non-digit characters), THE Frontend SHALL display an inline validation error in Arabic below the field indicating the expected minimum digit count
3. THE Frontend SHALL use `react-hook-form` with `zod` schemas for all form validation in the customer form and ledger form
4. WHEN a form submission fails due to a server error, THE Frontend SHALL display a toast notification in Arabic that includes a description of the failure reason returned by the server
5. WHILE a form is being submitted, THE Frontend SHALL disable the submit button and display a spinner within or adjacent to the submit button
6. WHEN the user submits the ledger form, THE Frontend SHALL validate that the ledger title is unique among existing ledgers by querying the server before completing submission
7. IF the ledger title uniqueness check determines the title already exists, THEN THE Frontend SHALL display an inline error message in Arabic below the title field indicating that the title is already in use, and SHALL prevent form submission
8. IF the ledger title uniqueness check fails due to a network or server error, THEN THE Frontend SHALL display a toast notification in Arabic indicating that uniqueness could not be verified, and SHALL prevent form submission

### Requirement 8: Optimize Performance and Loading

**User Story:** As the system owner, I want the application to load quickly and respond instantly to interactions, so that my workflow is efficient.

#### Acceptance Criteria

1. THE Frontend SHALL implement code splitting using React lazy loading for page-level components
2. WHILE data is being fetched, THE Frontend SHALL display skeleton loading states instead of plain text spinners
3. THE Frontend SHALL configure TanStack Query with a `staleTime` of 30000 milliseconds and a `gcTime` of 300000 milliseconds to reduce unnecessary refetches
4. WHEN the user hovers over a navigation link, THE Frontend SHALL prefetch the data for the target page
5. THE Backend SHALL implement database connection pooling for the Drizzle ORM MySQL connection with a minimum of 2 and a maximum of 10 concurrent connections
6. IF a query takes longer than 5 seconds, THEN THE Frontend SHALL display a timeout message with a retry option
7. WHEN the application is loaded for the first time, THE Frontend SHALL render the initial interactive page within 3 seconds on a standard broadband connection

### Requirement 9: Modern Animations and Transitions

**User Story:** As the system owner, I want smooth animations and transitions throughout the interface, so that the application feels polished and professional.

#### Acceptance Criteria

1. THE Frontend SHALL animate page transitions using Framer Motion with a fade from opacity 0 to 1 combined with a vertical slide of 10px, completing within 300ms using an ease-out timing function
2. THE Frontend SHALL animate list items with staggered entrance animations, where each successive item is delayed by 50ms and each item animates from opacity 0 to 1 with a vertical slide of 10px over 300ms
3. WHEN the user hovers over a card element, THE Frontend SHALL animate the card to a scale of 1.02 and elevate its shadow by 4px over a duration of 200ms
4. WHEN a dialog opens, THE Frontend SHALL animate it from scale 0.95 and opacity 0 to scale 1 and opacity 1 over 200ms; WHEN a dialog closes, THE Frontend SHALL animate it from scale 1 and opacity 1 to scale 0.95 and opacity 0 over 150ms
5. WHEN the sidebar collapse or expand action is triggered, THE Frontend SHALL animate the sidebar width change over a duration of 300ms using an ease-out timing function
6. IF the user's system has `prefers-reduced-motion: reduce` enabled, THEN THE Frontend SHALL disable all transform-based and motion animations and apply only opacity transitions with a maximum duration of 100ms

### Requirement 10: Improve Navigation and User Experience

**User Story:** As the system owner, I want intuitive navigation with clear visual feedback, so that I always know where I am in the application.

#### Acceptance Criteria

1. THE Dashboard_Layout SHALL highlight the currently active navigation item with a visually differentiated style (different background color and text color from inactive items) so that the active item is distinguishable without relying on color alone (e.g., includes a bold font weight or filled background)
2. THE Dashboard_Layout SHALL display breadcrumb navigation on the Ledger Detail page showing the navigation path (Ledgers link > current ledger name) so the user can navigate back to the parent page
3. WHEN a navigation item is clicked, THE Frontend SHALL apply a visual state change (such as a loading indicator or pressed/active style) to the clicked item within 100 milliseconds, before the destination page content finishes loading
4. THE Frontend SHALL support keyboard navigation such that all interactive elements (navigation items, buttons, links, form controls, toggles) are reachable via the Tab key and activatable via Enter or Space keys, with a visible focus indicator on the currently focused element
5. WHEN the user navigates back to a previously visited page using the browser back button, THE Frontend SHALL restore the scroll position to where the user last scrolled on that page
6. THE Dashboard_Layout SHALL display the app logo (icon) and title text ("دفتر السداد") in the sidebar header, fitting within the 64px header height without truncation when the sidebar is expanded
7. WHILE the sidebar is in collapsed (icon-only) state, THE Dashboard_Layout SHALL hide the title text and display only the app logo icon in the sidebar header

### Requirement 11: Improve Table and Data Display

**User Story:** As the system owner, I want tables to be easy to read and interact with, so that I can quickly find and manage payment information.

#### Acceptance Criteria

1. WHEN a table contains more than 20 rows, THE Frontend SHALL display only 20 rows per page and render pagination controls (previous page, next page, and current page indicator) below the table
2. THE Frontend SHALL implement sortable columns for customer name, payment status, and payment date, defaulting to ascending order by customer name, and SHALL display a directional arrow indicator on the currently sorted column
3. WHEN the user hovers over a table row, THE Frontend SHALL apply a visibly distinct background color to that row that differs from both the default and alternating row colors
4. THE Frontend SHALL display alternating row background colors (odd rows and even rows) across all data tables
5. THE Frontend SHALL display a count summary above each table showing three values: total items, filtered items (after search or filter), and currently displayed items (on the current page)
6. WHEN a table has no data, THE Frontend SHALL display an empty state containing an icon or illustration and a call-to-action button that navigates to the relevant creation action for that table's context (e.g., "إضافة عميل" for the customers table, "إنشاء دفتر شهري جديد" for the ledgers table)

### Requirement 12: Fix Console Errors and Type Safety

**User Story:** As a developer, I want zero console errors and full type safety, so that the application is reliable and debuggable.

#### Acceptance Criteria

1. THE Frontend SHALL produce zero TypeScript compilation errors when running `pnpm run check`
2. THE Frontend SHALL contain zero `any` type annotations in page components (client/src/pages/) and SHALL use named TypeScript interfaces or type aliases that match the corresponding API response shapes
3. THE Frontend SHALL define TypeScript interfaces for all tRPC query and mutation response shapes, each matching the fields and types returned by the corresponding backend procedure
4. THE Backend SHALL define explicit return type annotations or Zod output schemas for all tRPC procedures in server/routers.ts such that the inferred return type contains no `any`
5. WHILE the user navigates through the dashboard, customers list, ledger list, ledger detail, and reports pages, THE System SHALL produce zero errors or warnings in the browser developer console
6. IF a nullable field (paymentDate or notes) is null, THEN THE Frontend SHALL render an empty string or a designated placeholder (such as "—") instead of "null", "undefined", or throwing a runtime error
7. THE Frontend SHALL use optional chaining or explicit null checks for all references to paymentDate and notes fields before formatting or displaying their values

### Requirement 13: Improve Security and Input Validation

**User Story:** As the system owner, I want the application to be secure against common attacks, so that my data is protected.

#### Acceptance Criteria

1. THE Backend SHALL validate all input data using Zod schemas before processing, rejecting any request that fails schema validation with a 400 status response
2. THE Backend SHALL sanitize string inputs by stripping HTML tags and limiting string fields to a maximum of 1000 characters before storing data
3. WHILE rate limiting is active, THE Backend SHALL allow a maximum of 30 mutation requests (create, update, delete) per IP address per 60-second sliding window
4. THE Backend SHALL validate that all entity IDs conform to a 21-character nanoid pattern (alphanumeric plus hyphen and underscore) before database queries
5. THE Frontend SHALL rely on React's default JSX escaping for all user-provided content rendered in the DOM, and SHALL NOT use dangerouslySetInnerHTML with unsanitized data
6. IF an invalid ID format is provided, THEN THE Backend SHALL return a 400 error indicating the ID format is invalid, without querying the database
7. IF a client exceeds the rate limit threshold, THEN THE Backend SHALL return a 429 status response indicating the request limit has been exceeded and SHALL include a Retry-After header specifying the number of seconds until the next request is allowed

### Requirement 14: Define Database Relations

**User Story:** As a developer, I want database relations properly defined, so that queries can use joins efficiently and data integrity is enforced.

#### Acceptance Criteria

1. THE Data_Layer SHALL define a one-to-many Drizzle ORM relation from customers to payments using the customerId foreign key column, where one customer has many payments
2. THE Data_Layer SHALL define a one-to-many Drizzle ORM relation from ledgers to payments using the ledgerId foreign key column, where one ledger has many payments
3. THE Data_Layer SHALL define a one-to-many Drizzle ORM relation from users to customers using the userId foreign key column, where one user has many customers
4. THE Data_Layer SHALL define a one-to-many Drizzle ORM relation from users to ledgers using the userId foreign key column, where one user has many ledgers
5. WHEN a customer is deleted, THE Data_Layer SHALL cascade-delete all associated payment records linked by customerId
6. WHEN a ledger is deleted, THE Data_Layer SHALL cascade-delete all associated payment records linked by ledgerId
7. THE Data_Layer SHALL enforce foreign key constraints at the database level for all defined relations (customers.userId → users.id, ledgers.userId → users.id, payments.customerId → customers.id, payments.ledgerId → ledgers.id)
8. THE Data_Layer SHALL enforce a unique constraint on the combination of customerId and ledgerId in the payments table to prevent duplicate payment records for the same customer within the same ledger

### Requirement 15: Clean Up Unused Dependencies and Files

**User Story:** As a developer, I want the project free of dead code and unused dependencies, so that the bundle size is minimal and the codebase is clear.

#### Acceptance Criteria

1. THE System SHALL remove the `next-themes` package from `dependencies` in `package.json` (custom ThemeContext is used instead)
2. THE System SHALL remove the Manus-specific debug plugins and files (`vite-plugin-manus-runtime` from `devDependencies`, `.manus` directory, `client/public/__manus__` directory, and any `vite-plugin-manus-runtime` import in `vite.config.ts`)
3. THE System SHALL remove components (`AIChatBox`, `ManusDialog`, `Map`) that have zero import statements referencing them across all `.ts` and `.tsx` source files in the project
4. THE System SHALL remove the `drizzle/relations.ts` file if it contains only an empty import statement (`import {} from "./schema"`) with no exported relations
5. IF the `Home.tsx` page component is not imported or routed to in `App.tsx`, THEN THE System SHALL remove the `Home.tsx` file from `client/src/pages/`
6. THE System SHALL remove any `@radix-ui/*` package from `package.json` that has zero import statements referencing it across all files in `client/src/components/ui/`
7. WHEN all removals are complete, THE System SHALL produce a successful build (`pnpm run build` exits with code 0) and pass type-checking (`pnpm run check` exits with code 0) with no unresolved import errors

### Requirement 16: Improve Error Handling and Recovery

**User Story:** As the system owner, I want clear error messages and recovery options when something goes wrong, so that I can continue working without confusion.

#### Acceptance Criteria

1. WHEN an API request returns an error from tRPC, THE Frontend SHALL display a toast notification in Arabic describing the failure cause, visible for at least 4 seconds before auto-dismissing
2. WHEN a network error occurs (request fails to reach the server), THE Frontend SHALL display a visible offline indicator and automatically retry the failed request up to 3 times with a 5-second interval between attempts
3. WHEN the user toggles a payment status, THE Frontend SHALL immediately reflect the new status in the UI (optimistic update), and IF the server request fails, THEN THE Frontend SHALL revert the displayed status to its previous value and display an Arabic error toast
4. IF a page fails to load data after all retry attempts are exhausted, THEN THE Frontend SHALL display an error state showing an Arabic error message and a "إعادة المحاولة" (retry) button that re-fetches the data when clicked
5. WHEN an unhandled runtime error is caught by the Error Boundary, THE Error Boundary SHALL display an Arabic error message and a "إعادة تحميل" (reload) button that refreshes the page when clicked
6. WHEN a mutation fails, THE Frontend SHALL preserve all user-entered form field values until the user navigates away from the page or the mutation succeeds on retry, so the user can retry submission without re-entering data

### Requirement 17: Scalable Code Architecture

**User Story:** As a developer, I want the codebase organized with clear separation of concerns, so that new features can be added without increasing complexity.

#### Acceptance Criteria

1. THE Backend SHALL split the tRPC router into separate files per domain (`server/routers/customers.ts`, `server/routers/ledgers.ts`, `server/routers/payments.ts`) and compose them into the appRouter via a single entry file (`server/routers/index.ts`) that re-exports the merged router
2. THE Frontend SHALL organize components used exclusively by a single page into that page's subdirectory (e.g., `pages/customers/`, `pages/ledgers/`), while components referenced by 2 or more pages SHALL remain in `components/`
3. THE System SHALL define shared Zod validation schemas in `shared/schemas.ts` for all entity input shapes (customer, ledger, payment) that are imported by both frontend form validation and backend tRPC input definitions
4. THE Frontend SHALL derive API response types using tRPC's `inferRouterOutputs` utility from the AppRouter type, rather than manually duplicating response type definitions
5. THE System SHALL enforce a unidirectional dependency rule: `pages/` modules may import from `components/` and `components/ui/`, `components/` modules may import from `components/ui/`, and `server/routers/` modules may import from `server/db.ts` or `server/supabase-db.ts` — no module SHALL import from a layer above it in this hierarchy
6. THE Backend SHALL place domain logic that performs data transformation, multi-step operations, or conditional business rules into service functions (one file per domain, e.g., `server/services/customers.ts`), while route handlers SHALL only parse input, call service functions, and return results
7. IF a new domain is added to the system, THEN THE System SHALL require no modifications to existing domain router files, existing page components, or existing service files to integrate the new domain

### Requirement 18: Preserve All Existing Functionality

**User Story:** As the system owner, I want all current features to continue working after the overhaul, so that no functionality is lost.

#### Acceptance Criteria

1. THE System SHALL maintain the ability to create, read, update, and delete customers, where each customer record includes full name, phone number, optional notes, and active/inactive status
2. THE System SHALL maintain the ability to toggle a customer's active/inactive status, where inactive customers do not appear in newly created ledgers
3. THE System SHALL maintain the ability to create monthly ledgers with a title and month-year date, and list all existing ledgers with their active/inactive status
4. THE System SHALL maintain the ability to toggle payment status (paid/unpaid) for each customer within a ledger, recording the payment date when marked as paid
5. THE System SHALL maintain the ability to view payment statistics per ledger including total customers, paid count, unpaid count, and payment percentage, displayed via pie chart and bar chart
6. THE System SHALL maintain the ability to export customer data and ledger data to Excel and CSV formats, and export reports to PDF format
7. THE System SHALL maintain the ability to search customers by name or phone number, and filter payments within a ledger by status (all, paid, unpaid)
8. THE System SHALL maintain the ability to switch between dark and light themes, persisting the user's preference across sessions via local storage
9. THE System SHALL maintain the authentication flow via OAuth login/logout, redirecting unauthenticated users to the login page

### Requirement 19: Improve Database Connection Reliability

**User Story:** As the system owner, I want the database connection to be reliable and self-healing, so that the application does not go down due to transient connection issues.

#### Acceptance Criteria

1. IF the initial database connection fails, THEN THE Data_Layer SHALL retry up to 5 times with exponential backoff starting at 1 second and capping at 30 seconds between attempts
2. THE Data_Layer SHALL implement a health check endpoint at `/health` that executes a lightweight query against the database and responds within 5 seconds, returning a JSON object indicating connection status as "connected" or "disconnected"
3. IF the database connection is lost during operation, THEN THE Data_Layer SHALL attempt automatic reconnection up to 3 times within 30 seconds before reporting the connection as unavailable
4. THE Data_Layer SHALL log connection state changes (connected, disconnected, reconnecting) with timestamps for debugging
5. IF the database is unreachable after all reconnection attempts are exhausted, THEN THE Backend SHALL return a 503 Service Unavailable status for any request that requires database access
6. THE Data_Layer SHALL configure connection pool settings with a minimum of 2 connections, a maximum of 10 connections, and an idle timeout of 60 seconds
7. IF all retry attempts on initial connection are exhausted, THEN THE Data_Layer SHALL start the server in a degraded mode and continue retrying in the background every 30 seconds

### Requirement 20: Professional UI Polish

**User Story:** As the system owner, I want the interface to look modern and professional, so that the application inspires confidence and is pleasant to use.

#### Acceptance Criteria

1. THE Frontend SHALL use spacing values that are multiples of 8px (8, 16, 24, 32, 40, 48) for all margin and padding across all pages
2. THE Frontend SHALL use the design-token-based border radius system (--radius: 0.75rem) with derived values (sm, md, lg, xl) consistently across all card and button components
3. THE Frontend SHALL implement a color palette where all text-on-background combinations meet WCAG AA contrast ratios (minimum 4.5:1 for normal text sized below 18pt, minimum 3:1 for large text sized 18pt or above and for UI components)
4. WHEN page content is loading, THE Frontend SHALL display loading skeletons that match the dimensions and position of the content being loaded (same number of rows, same card grid layout, same approximate height)
5. THE Frontend SHALL use Lucide icon library icons at sizes of 16px for inline text, 20px for buttons and navigation items, and 24px for page headings and empty states
6. WHEN an interactive element receives keyboard focus, THE Frontend SHALL display a visible focus ring of at least 2px width using the --ring color token with a 2px offset from the element boundary
7. IF a page section fails to load after the skeleton is displayed for more than 5 seconds, THEN THE Frontend SHALL replace the skeleton with an error message indicating the content could not be loaded and offering a retry action
