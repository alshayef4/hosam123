# Tech Stack & Build System

## Package Manager

- **pnpm** (v10.4.1) — always use `pnpm` for install/run commands

## Frontend

- React 19 + TypeScript 5.9
- Tailwind CSS 4 (via Vite plugin, not PostCSS)
- shadcn/ui components (Radix primitives + CVA)
- wouter for routing
- Framer Motion for animations
- Recharts for data visualization
- react-hook-form + zod for form validation
- Sonner for toast notifications

## Backend

- Express 4 + tRPC 11 (all API via `/api/trpc`)
- Superjson for serialization (Dates stay as Dates)
- Drizzle ORM with MySQL (TiDB Cloud)
- Supabase as secondary data layer (`server/supabase-db.ts`)
- Zod for input validation

## Data Layer

- Primary schema: `drizzle/schema.ts` (Drizzle ORM)
- Database: MySQL/TiDB Cloud
- Supabase used for runtime queries (`server/supabase-db.ts`)

## Testing

- Vitest for unit/integration tests
- Test files live alongside source: `server/*.test.ts`

## Path Aliases

- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

## Common Commands

```bash
pnpm run dev          # Start dev server (tsx watch)
pnpm run build        # Production build (Vite + esbuild)
pnpm run start        # Run production build
pnpm run check        # TypeScript type-check (no emit)
pnpm run format       # Prettier format all files
pnpm test             # Run Vitest tests (single run)
pnpm db:push          # Generate + run Drizzle migrations
```

## Key Libraries

| Purpose | Library |
|---------|---------|
| API layer | tRPC 11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) |
| State/cache | TanStack React Query 5 |
| ORM | Drizzle ORM |
| Validation | Zod 4 |
| UI primitives | Radix UI |
| Styling | Tailwind CSS 4 + tailwind-merge + CVA |
| Icons | Lucide React |
| Dates | date-fns |
| IDs | nanoid |
