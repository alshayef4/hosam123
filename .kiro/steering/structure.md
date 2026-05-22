# Project Structure

```
payment_ledger/
├── client/                    # Frontend (React + Vite)
│   ├── index.html             # HTML entry point
│   ├── public/                # Static assets (favicon, robots.txt only)
│   └── src/
│       ├── App.tsx            # Routes & layout wiring
│       ├── main.tsx           # React providers entry
│       ├── index.css          # Global styles & CSS variables (Tailwind)
│       ├── const.ts           # Frontend constants
│       ├── _core/hooks/       # Core hooks (useAuth)
│       ├── components/        # Reusable components
│       │   ├── ui/            # shadcn/ui primitives
│       │   ├── DashboardLayout.tsx
│       │   └── ...            # App-level shared components
│       ├── contexts/          # React contexts (ThemeContext)
│       ├── hooks/             # Custom hooks
│       ├── lib/               # Utilities (trpc client binding)
│       └── pages/             # Page-level components
│           ├── Dashboard.tsx
│           ├── Customers.tsx
│           ├── Ledgers.tsx
│           ├── LedgerDetail.tsx
│           ├── Reports.tsx
│           └── Home.tsx
├── server/                    # Backend (Express + tRPC)
│   ├── _core/                 # Framework plumbing (DO NOT EDIT)
│   │   ├── index.ts           # Server entry point
│   │   ├── trpc.ts            # tRPC setup & procedures
│   │   ├── context.ts         # Request context builder
│   │   ├── env.ts             # Environment variables
│   │   ├── llm.ts             # LLM integration helper
│   │   └── ...                # OAuth, storage proxy, notifications
│   ├── routers.ts             # tRPC procedures (main API)
│   ├── db.ts                  # Drizzle query helpers
│   ├── supabase-db.ts         # Supabase query layer
│   ├── storage.ts             # S3 file storage helpers
│   └── *.test.ts              # Vitest test files
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts              # Table definitions & types
│   ├── relations.ts           # Table relations
│   └── migrations/            # Generated SQL migrations
├── shared/                    # Shared between client & server
│   ├── const.ts               # Shared constants
│   ├── types.ts               # Unified type exports
│   └── _core/                 # Core shared utilities
└── references/                # Project documentation
```

## Key Conventions

- **Do not edit** files under `server/_core/` — that's framework infrastructure.
- **Pages** are top-level route components in `client/src/pages/`.
- **UI components** go in `client/src/components/`; shadcn primitives in `components/ui/`.
- **tRPC procedures** are defined in `server/routers.ts`. Split into sub-files under `server/routers/` if the file exceeds ~150 lines.
- **Database changes**: update `drizzle/schema.ts`, then run `pnpm db:push`.
- **Query helpers** go in `server/db.ts` or `server/supabase-db.ts` — routers call these, not raw SQL.
- **Shared types** are exported from `shared/types.ts` and imported via `@shared/*`.
- **Tests** are colocated with server code as `server/*.test.ts`.
