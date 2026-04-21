# Event RSVP

A modern, minimal event RSVP platform built for tech communities. Create events, manage attendance with smart capacity and waitlist, bring your community together.

**Stack:** Next.js 16.2 · React 19.2 · TypeScript · Prisma 7 · PostgreSQL 16 · NextAuth v5 · shadcn/ui · Tailwind CSS 4

## Features

- **Magic link authentication** (passwordless, dev-mode bypass)
- **Event CRUD** with admin approval workflow (DRAFT → PENDING → APPROVED)
- **Smart RSVP** with capacity limit and automatic waitlist promotion (Serializable transactions)
- **Speaker management** per event
- **Role-based access** (Admin, Organizer, Attendee)
- **Public event pages** with Open Graph metadata

## Getting Started

### Prerequisites

- Node.js 20.9+
- PostgreSQL 16
- pnpm

### Setup

```bash
# 1. Clone and install
git clone https://github.com/Menesahin/event-rsvp.git
cd event-rsvp
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, AUTH_SECRET (npx auth secret), DEV_MODE=true

# 3. Setup database
createdb event_rsvp
pnpm prisma migrate dev

# 4. Seed test data (optional)
pnpm db:seed

# 5. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts (from seed)

- `admin@eventrsvp.dev` — ADMIN
- `organizer@eventrsvp.dev` — ORGANIZER
- `attendee@eventrsvp.dev` — ATTENDEE

In dev mode (`DEV_MODE=true`), the magic link is displayed directly in the UI instead of being emailed.

## Architecture

Spec-driven development. Documentation is the source of truth.

- `docs/` — Feature specs, API spec, UI wireframes, ADRs, security, roadmap
- `src/app/` — Next.js App Router (route groups: public, auth, dashboard, admin)
- `src/lib/` — Repositories, server actions, guards, error classes, utilities
- `src/components/` — UI components (shadcn/ui primitives + feature components)
- `prisma/` — Schema, migrations, seed

### Key Patterns

- **Repository pattern** — All DB access via `src/lib/repositories/` (never Prisma directly in pages/actions)
- **Guard pattern** — `requireAuth()`, `requireRole()`, `requireOwnership()` at page + action level
- **Result pattern** — `Result<T, E>` for typed domain errors in RSVP logic
- **Custom error hierarchy** — `AppError` base class with `ValidationError`, `NotFoundError`, `ForbiddenError`, etc.
- **Zod validation** — Schema-first input validation at server action boundary
- **Structured logging** — Pino with module-scoped child loggers
- **Server Actions** — All mutations via server actions with `validate → authenticate → authorize → execute` pattern

## Commands

```bash
pnpm dev           # Start dev server (Turbopack)
pnpm build         # Production build
pnpm lint          # Run ESLint

pnpm prisma generate      # Generate Prisma client
pnpm prisma migrate dev   # Apply schema migrations
pnpm db:seed              # Seed test data
pnpm prisma studio        # Open Prisma Studio GUI
```

## License

MIT
